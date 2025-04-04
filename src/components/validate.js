export function setErrorState(input, settings, message = '') {
  const errorElement = document.getElementById(`${input.name}-error`);
  errorElement.textContent = message;
  
  const lineCount = message.split('\n').length;
  if (lineCount > 2) {
    input.closest('.popup').style.height = 'auto';
  }
}

export function checkInputValidity(formElement, inputElement, settings) {
  if (!inputElement.validity.valid) {
    let message = '';
    
    if (inputElement.validity.valueMissing || (inputElement.validity.typeMismatch && inputElement.type === 'url')) {
      message = inputElement.type === 'url' 
        ? 'Введите адрес сайта' 
        : 'Вы пропустили это поле';
    } 
    else if (inputElement.validity.tooShort) {
      message = `Минимальное количество символов: ${inputElement.minLength}. Длина текста сейчас: ${inputElement.value.length}`;
    }
    else {
      message = inputElement.validationMessage; 
    }
    
    setErrorState(inputElement, settings, message);
  } else {
    setErrorState(inputElement, settings);
  }
}

export function toggleButtonState(inputs, button, settings) {
  const isValid = inputs.every(input => input.validity.valid);
  button.disabled = !isValid;
  button.classList.toggle(settings.inactiveButtonClass, !isValid);
}

function setEventListeners(formElement, settings) {
  const inputs = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const button = formElement.querySelector(settings.submitButtonSelector);

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      checkInputValidity(formElement, input, settings);
      toggleButtonState(inputs, button, settings);
    });
  });
}

export function enableValidation(settings) {
  const forms = Array.from(document.querySelectorAll(settings.formSelector));
  forms.forEach(formElement => {
    setEventListeners(formElement, settings);
  });
}