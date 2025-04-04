export function openModal(popup) {
  popup.classList.add('popup_is-opened');
  document.addEventListener('keydown', closeByEsc);
}

export function closeModal(popup) {
  popup.classList.remove('popup_is-opened');
  document.removeEventListener('keydown', closeByEsc);
}

function closeByEsc(evt) {
  const ESC_KEY = 'Escape';
  if (evt.key === ESC_KEY) {
      const openedPopup = document.querySelector('.popup_is-opened');
      if (openedPopup) {
          closeModal(openedPopup);
      }
  }
}

export function addPopupAnimation() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => popup.classList.add('popup_is-animated'));
}

export function setOverlayCloseListener() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => {
      popup.addEventListener('mousedown', (evt) => {
        if (evt.target === popup && popup.classList.contains('popup_is-opened')) {
          closeModal(popup);
        }
      });
  });
}