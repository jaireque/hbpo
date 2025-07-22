const sammy = document.getElementById('sammy');
const chatBox = document.getElementById('chat-box');
const input = document.getElementById('user-input');
const messages = document.getElementById('chat-messages');
const triviaBox = document.getElementById('trivia-box');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');

let hasWelcomed = false;
let threadId = localStorage.getItem('threadId') || null;
let selectedFile = null;

setInterval(() => {
  sammy.classList.toggle('bounce');
}, 15000);

sammy.addEventListener('click', () => {
  chatBox.classList.toggle('active');
  if (chatBox.classList.contains('active') && !hasWelcomed) {
    setTimeout(() => {
      messages.innerHTML += `
      <div class="message bot">
        <img src="assets/images/sammy_head.png" alt="Sammy cabeza" />
        <div class="bubble">El cumplimiento nos llama, dime cómo puedo ayudarte el día de hoy.</div>
      </div>`;
      messages.scrollTop = messages.scrollHeight;
      hasWelcomed = true;
    }, 500);
  }
});

fileInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    showFilePreview(file);
  }
});

function showFilePreview(file) {
  const fileName = file.name;
  const fileSize = (file.size / 1024).toFixed(2);
  filePreview.innerHTML = `
    <div class="file-item">
      <span class="file-info">📎 ${fileName} (${fileSize} KB)</span>
      <button class="remove-file" onclick="removeFile()" title="Remove file">✖</button>
    </div>
  `;
  filePreview.style.display = 'block';
}

function removeFile() {
  selectedFile = null;
  fileInput.value = '';
  filePreview.style.display = 'none';
}

function minimizeChat() {
  chatBox.classList.remove('active');
}

function sendMessage() {
  const userText = input.value.trim();
  if (!userText && !selectedFile) return;

  let userMessageHtml = `<div class="message user"><div class="bubble">`;
  if (userText) {
    userMessageHtml += userText;
  }
  if (selectedFile) {
    userMessageHtml += `<br><small>📎 ${selectedFile.name}</small>`;
  }
  userMessageHtml += `</div></div>`;

  messages.innerHTML += userMessageHtml;
  messages.scrollTop = messages.scrollHeight;
  input.value = "";

  const loaderId = 'loader-' + Date.now();
  messages.innerHTML += `
    <div class="message bot" id="${loaderId}">
      <img src="assets/images/sammy_head.png" />
      <div class="bubble" style="display: flex; align-items: center; justify-content: center;">
        <img src="assets/images/loader.gif" class="loader-gif" alt="Loading..." />
        Sammy está pensando...
      </div>
    </div>`;
  messages.scrollTop = messages.scrollHeight;

  const formData = new FormData();
  if (userText) formData.append('message', userText);
  if (threadId) formData.append('threadId', threadId);
  if (selectedFile) formData.append('file', selectedFile);

  fetch('https://sammyagentbackend.up.railway.app/ask', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const loaderElement = document.getElementById(loaderId);
      if (loaderElement) loaderElement.remove();

      if (data.threadId) {
        threadId = data.threadId;
        localStorage.setItem('threadId', threadId); // Guardar threadId
      }

      const botResponse = data.response || data.message || 'Lo siento, no pude procesar tu solicitud.';
      const botBubble = document.createElement('div');
      botBubble.className = 'message bot';
      botBubble.innerHTML = `
        <img src="assets/images/sammy_head.png" />
        <div class="bubble">${botResponse}</div>
      `;
      messages.appendChild(botBubble);
      messages.scrollTop = messages.scrollHeight;
    })
    .catch(error => {
      console.error('Error:', error);
      const loaderElement = document.getElementById(loaderId);
      if (loaderElement) loaderElement.remove();

      messages.innerHTML += `
        <div class="message bot">
          <img src="assets/images/sammy_head.png" />
          <div class="bubble">Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.</div>
        </div>`;
      messages.scrollTop = messages.scrollHeight;
    })
    .finally(() => {
      removeFile();
    });
}

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendMessage();
});

// === Trivia ===
const triviaData = [
  {
    question: "What is the primary goal of Anti-Money Laundering (AML) regulations?",
    options: { A: "Protect client data", B: "Prevent financial crimes", C: "Monitor employees" },
    answer: "B"
  },
  {
    question: "Which agency enforces the FCPA?",
    options: { A: "FBI", B: "FinCEN", C: "SEC" },
    answer: "C"
  },
  {
    question: "Which of these is a compliance red flag?",
    options: { A: "Consistent reports", B: "Large round transactions", C: "Audits" },
    answer: "B"
  },
  {
    question: "What does KYC stand for?",
    options: { A: "Know Your Customer", B: "Keep Your Compliance", C: "Key Yearly Check" },
    answer: "A"
  },
  {
    question: "Which of these is NOT a red flag for money laundering?",
    options: { A: "Frequent large cash deposits", B: "Regular salary payments", C: "Transactions with no clear purpose" },
    answer: "B"
  },
  {
    question: "What is the main purpose of sanctions screening?",
    options: { A: "Tax compliance", B: "Preventing business with prohibited entities", C: "Marketing research" },
    answer: "B"
  }
];

let currentTrivia = 0;

function loadTrivia() {
  const trivia = triviaData[currentTrivia];
  document.getElementById("trivia-question").textContent = trivia.question;
  const optionsBox = document.getElementById("trivia-options");
  const feedback = document.getElementById("trivia-feedback");
  feedback.textContent = "";
  optionsBox.innerHTML = "";

  for (let key in trivia.options) {
    const btn = document.createElement("button");
    btn.textContent = `${key}. ${trivia.options[key]}`;
    btn.onclick = () => {
      feedback.textContent = (key === trivia.answer) ? "✅ Correct!" : "❌ Not quite.";
      setTimeout(() => {
        loadTrivia();
      }, 2000);
    };
    optionsBox.appendChild(btn);
  }

  currentTrivia = (currentTrivia + 1) % triviaData.length;
}

loadTrivia();
setInterval(loadTrivia, 30000);

// === Dragging ===
function makeDraggable(box) {
  let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
  const chatHeader = box.querySelector('.chat-header');

  if (chatHeader) {
    chatHeader.onmousedown = function (e) {
      if (e.target.tagName === "BUTTON") return;

      e.preventDefault();
      mouseX = e.clientX;
      mouseY = e.clientY;
      document.onmouseup = closeDrag;
      document.onmousemove = drag;

      chatHeader.style.cursor = 'grabbing';
    };

    chatHeader.style.cursor = 'grab';
  } else {
    box.onmousedown = function (e) {
      if (["INPUT", "TEXTAREA", "BUTTON"].includes(e.target.tagName)) return;
      e.preventDefault();
      mouseX = e.clientX;
      mouseY = e.clientY;
      document.onmouseup = closeDrag;
      document.onmousemove = drag;
    };
  }

  function drag(e) {
    e.preventDefault();
    posX = mouseX - e.clientX;
    posY = mouseY - e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;

    let newTop = box.offsetTop - posY;
    let newLeft = box.offsetLeft - posX;

    const rect = box.getBoundingClientRect();
    const maxTop = window.innerHeight - rect.height;
    const maxLeft = window.innerWidth - rect.width;

    newTop = Math.max(0, Math.min(newTop, maxTop));
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    box.style.top = newTop + "px";
    box.style.left = newLeft + "px";
  }

  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;

    if (chatHeader) {
      chatHeader.style.cursor = 'grab';
    }
  }
}

makeDraggable(chatBox);
makeDraggable(triviaBox);

window.sendMessage = sendMessage;
window.minimizeChat = minimizeChat;
window.removeFile = removeFile;

// === Reset button (opcional) ===
const resetBtn = document.getElementById("reset-thread");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem('threadId');
    threadId = null;
    messages.innerHTML += `
      <div class="message bot">
        <img src="assets/images/sammy_head.png" />
        <div class="bubble">🔄 He olvidado el contexto. Puedes comenzar una nueva conversación.</div>
      </div>`;
    messages.scrollTop = messages.scrollHeight;
  });
}
