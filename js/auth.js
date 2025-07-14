const msalConfig = {
  auth: {
    clientId: "1d0fa77f-17a7-4bad-bf0d-faa907cc230f",
    authority: "https://login.microsoftonline.com/00ded2dd-b4f6-4531-837d-c11f5aa579f9", 
    redirectUri: "http://localhost:5500/"
  }
};

const loginRequest = {
  scopes: ["User.Read", "email", "profile", "openid"] 
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

export async function login() {
  try {
    const loginResponse = await msalInstance.loginPopup(loginRequest);
    console.log("Login successful:", loginResponse);

    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
      console.error("No account found after login.");
      return false; 
    }

    const tokenRequest = {
      scopes: ["User.Read", "Files.ReadWrite.All", "Sites.ReadWrite.All"],
      account: account
    };

    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
      console.log("Token acquired");
      token = tokenResponse.accessToken;
      return true; 
    } catch (silentError) {
      console.warn("Silent token acquisition failed:", silentError);

      if (silentError instanceof msal.InteractionRequiredAuthError) {
        try {
          const tokenResponse = await msalInstance.acquireTokenPopup(tokenRequest);
          console.log("Token acquired via popup:", tokenResponse.accessToken);
          token = tokenResponse.accessToken;
          return true; 
        } catch (popupError) {
          console.error("Error acquiring token via popup:", popupError);
          displayWarning();
          return false; 
        }
      } else {
        console.error("Unexpected error during silent token acquisition:", silentError);
        return false;
      }
    }
  } catch (loginError) {
    console.error("Login error:", loginError);
    displayWarning();
    return false; 
  }
}

function displayWarning(){
  Swal.fire({
    icon: 'warning',
    title: 'Acción Requerida! ',
    text: "Por favor habilita las ventanas emergentes, refresca la página e inicia sesión con tu cuenta de Microsoft",
  });
}


export let token;