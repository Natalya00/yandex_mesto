import { likeCard as apiLike, unlikeCard as apiUnlike, deleteCardFromServer } from './api.js';

export function createCard(name, link, likes, cardId, userId, ownerId, openImage, confirmDeletePopup, confirmDeleteButton) {
  const cardTemplate = document.querySelector('#card-template').content;
  const cardElement = cardTemplate.cloneNode(true).querySelector('.card');
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const cardDeleteButton = cardElement.querySelector('.card__delete-button');
  const cardLikeButton = cardElement.querySelector('.card__like-button');
  const cardLikeCount = cardElement.querySelector('.card__like-count');

  cardElement.dataset.id = cardId;
  cardImage.src = link;
  cardImage.alt = name;
  cardTitle.textContent = name;
  cardLikeCount.textContent = likes.length;

  const isLikedByMe = likes.some(like => like._id === userId);
  if (isLikedByMe) {
    cardLikeButton.classList.add('card__like-button_is-active');
  }

  if (userId !== ownerId) {
    cardDeleteButton.style.display = 'none';
  } else {
    cardDeleteButton.addEventListener('click', () => handleDeleteCard(cardElement, confirmDeletePopup, confirmDeleteButton));
  }

  cardLikeButton.addEventListener('click', (evt) => likeCard(evt, cardId, cardLikeCount));

  cardImage.addEventListener('click', () => openImage(name, link));

  return cardElement;
}

function likeCard(evt, cardId, likeCountElement) {
  const likeButton = evt.target;
  const isLiked = likeButton.classList.contains('card__like-button_is-active');

  const likePromise = isLiked ? apiUnlike(cardId) : apiLike(cardId);

  likePromise
    .then(card => {
      likeCountElement.textContent = card.likes.length;
      likeButton.classList.toggle('card__like-button_is-active');
    })
    .catch(err => {
      console.error('Ошибка при обновлении лайка:', err);
    });
}

function handleDeleteCard(cardElement, confirmDeletePopup, confirmDeleteButton) {
  confirmDeletePopup.classList.add('popup_is-opened');
  confirmDeleteButton.onclick = () => {
    const cardId = cardElement.dataset.id;
    deleteCardFromServer(cardId)
      .then(() => {
        cardElement.remove();
        confirmDeletePopup.classList.remove('popup_is-opened');
      })
      .catch(err => {
        console.error('Ошибка при удалении карточки:', err);
      });
  };
}
