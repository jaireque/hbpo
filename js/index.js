import { token } from './auth.js';

const loadingElements = document.getElementsByClassName('lds-default');

export async function makeFetch(userInput){
    Array.from(loadingElements).forEach(element => {
        element.style.display = 'block';
    });

    await makeServerCall(token, userInput)
}

export async function makeServerCall(token, userInput) {
    const serverEndpoint = "https://automaticcertificatesbackend.up.railway.app/send-email";
  
    const response = await fetch(serverEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token:token,
            cedula: userInput
        }),       
    })

    if(!response.ok){
        const errorData = await response.json();
        throw new Error('Network response was not ok, ' + errorData.message);
    }

    const result = await response.json(); 
    console.log('Success?', result);


    if (result.success) {
        displaySuccess("Se ha enviado el certificado laboral a " + result.email);
    }
    else{
        displayErrorM('Operation was not successful: \n' + result.message);
    }

    Array.from(loadingElements).forEach(element => {
        element.style.display = 'none';
    })
}
  
export function isEmptyString(value) {
    return typeof value === 'string' && value.trim() === '';
}

function displaySuccess(message){
    Swal.fire({
      icon: 'success',
      title: 'Certificado Generado!',
      text: message,
    });
}

function displayErrorM(message){
    Swal.fire({
      icon: 'error',
      title: 'Error! ',
      text: message,
    });
}



