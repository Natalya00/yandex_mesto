import { createCard } from './card.js';
import { openModal, closeModal, addPopupAnimation, setOverlayCloseListener } from './modal.js';
import { enableValidation, setErrorState, toggleButtonState } from './validate.js';
import { getInitialCards, getUserInfo, updateProfileInfo, addNewCard, updateUserAvatar, deleteCardFromServer } from './api.js';
import '../pages/index.css';

const elements = {
  profile: {
    editButton: document.querySelector('.profile__edit-button'),
    title: document.querySelector('.profile__title'),
    description: document.querySelector('.profile__description'),
    avatar: document.querySelector('.profile__image'),
    imageContainer: document.querySelector('.profile__image-container')
  },
  popups: {
    avatar: document.querySelector('.popup_type_avatar'),
    edit: document.querySelector('.popup_type_edit'),
    newCard: document.querySelector('.popup_type_new-card'),
    image: document.querySelector('.popup_type_image'),
    confirmDelete: document.querySelector('.popup_type_confirm-delete')
  },
  forms: {
    avatar: document.querySelector('.popup_type_avatar .popup__form'),
    profile: document.querySelector('.popup_type_edit .popup__form'),
    card: document.querySelector('.popup_type_new-card .popup__form')
  },
  inputs: {
    avatar: document.querySelector('.popup__input_type_avatar-url'),
    name: document.querySelector('.popup__input_type_name'),
    job: document.querySelector('.popup__input_type_description'),
    cardName: document.querySelector('.popup__input_type_card-name'),
    cardLink: document.querySelector('.popup__input_type_url')
  },
  buttons: {
    addCard: document.querySelector('.profile__add-button'),
    confirmDelete: document.querySelector('.popup__button_confirm')
  },
  cardsList: document.querySelector('.places__list'),
  imagePopup: {
    image: document.querySelector('.popup_type_image .popup__image'),
    caption: document.querySelector('.popup_type_image .popup__caption')
  }
};

const config = {
  validation: {
    formSelector: '.popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible'
  }
};

let currentUserId = null;

const openImagePopup = (name, link) => {
  elements.imagePopup.image.src = link;
  elements.imagePopup.image.alt = name;
  elements.imagePopup.caption.textContent = name;
  openModal(elements.popups.image);
};

const renderCards = (cards) => {
  elements.cardsList.innerHTML = ''; 
  cards.forEach(card => {
    const cardElement = createCard(
      card.name,
      card.link,
      card.likes,
      card._id,
      currentUserId,
      card.owner._id,
      openImagePopup, 
      elements.popups.confirmDelete,
      elements.buttons.confirmDelete
    );
    elements.cardsList.append(cardElement);
  });
};

const handleFormSubmit = (request, form, popup, onSuccess, resetForm = true) => (evt) => {
  evt.preventDefault();
  const submitButton = form.querySelector(config.validation.submitButtonSelector);
  const originalText = submitButton.textContent;

  if (submitButton.disabled) return;

  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  request()
  .then((data) => {
    if (onSuccess) onSuccess(data);
    if (resetForm) form.reset();
    closeModal(popup);
  })
  .catch(console.error)
  .finally(() => {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  });
};

const handleProfileSubmit = handleFormSubmit(
  () => updateProfileInfo(elements.inputs.name.value, elements.inputs.job.value),
  elements.forms.profile,
  elements.popups.edit,
  (userData) => {
    elements.profile.title.textContent = userData.name;
    elements.profile.description.textContent = userData.about;
  },
  false
);

const handleCardSubmit = handleFormSubmit(
  () => {
    if (elements.forms.card.dataset.processing === 'true') return Promise.reject();
    elements.forms.card.dataset.processing = 'true';
    return addNewCard(elements.inputs.cardName.value, elements.inputs.cardLink.value)
      .finally(() => {
        elements.forms.card.dataset.processing = 'false';
      });
  },
  elements.forms.card,
  elements.popups.newCard,
  (card) => {
    const cardElement = createCard(
      card.name,
      card.link,
      card.likes,
      card._id,
      currentUserId,
      card.owner._id,
      openImagePopup,
      elements.popups.confirmDelete,
      elements.buttons.confirmDelete
    );
    elements.cardsList.prepend(cardElement);
  }
);

const handleAvatarSubmit = handleFormSubmit(
  () => updateUserAvatar(elements.inputs.avatar.value),
  elements.forms.avatar,
  elements.popups.avatar,
  (userData) => {
    elements.profile.avatar.style.backgroundImage = `url(${userData.avatar})`;
  }
);

const loadData = () => {
  Promise.all([getUserInfo(), getInitialCards()])
    .then(([userData, cards]) => {
      currentUserId = userData._id;
      elements.profile.title.textContent = userData.name;
      elements.profile.description.textContent = userData.about;
      elements.profile.avatar.style.backgroundImage = `url(${userData.avatar})`;
      renderCards(cards);
      document.querySelector('.page__content').classList.add('page__content_loaded');
    })
    .catch(err => {
      console.error('Ошибка загрузки данных:', err);
      document.querySelector('.page__content').classList.add('page__content_loaded');
    });
};

const setupPopup = (openButton, popup, setupCallback) => {
  openButton.addEventListener('click', () => {
    if (setupCallback) setupCallback();
    openModal(popup);
  });
};

const init = () => {
  addPopupAnimation();
  setOverlayCloseListener();
  enableValidation(config.validation);
  loadData();
  
  setupPopup(elements.profile.editButton, elements.popups.edit, () => {
    elements.inputs.name.value = elements.profile.title.textContent;
    elements.inputs.job.value = elements.profile.description.textContent;
    setErrorState(elements.inputs.name, config.validation);
    setErrorState(elements.inputs.job, config.validation);
  });

  setupPopup(elements.buttons.addCard, elements.popups.newCard, () => {
    elements.forms.card.reset();
    setErrorState(elements.inputs.cardName, config.validation);
    setErrorState(elements.inputs.cardLink, config.validation);
  });

  setupPopup(elements.profile.imageContainer, elements.popups.avatar, () => {
    elements.forms.avatar.reset();
    setErrorState(elements.inputs.avatar, config.validation); 
    const inputs = [elements.inputs.avatar]; 
    const button = elements.forms.avatar.querySelector(config.validation.submitButtonSelector); 
    toggleButtonState(inputs, button, config.validation);
  });  

  document.querySelectorAll('.popup__close').forEach(button => {
    button.addEventListener('click', () => closeModal(button.closest('.popup')));
  });

  elements.forms.profile.addEventListener('submit', handleProfileSubmit);
  elements.forms.card.addEventListener('submit', handleCardSubmit);
  elements.forms.avatar.addEventListener('submit', handleAvatarSubmit);
};

init();