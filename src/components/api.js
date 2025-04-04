const baseUrl = 'https://nomoreparties.co/v1';
const cohortId = 'apf-cohort-202'; 
const token = '4ae51c60-1bf5-4efd-8059-009229741aba'; 

const headers = {
  authorization: token,
  'Content-Type': 'application/json'
};

function makeRequest(endpoint, method = 'GET', body = null) {
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  return fetch(`${baseUrl}/${cohortId}${endpoint}`, config)
    .then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return Promise.reject(error.message || `HTTP error ${res.status}`);
      }
      return res.json();
    })
    .catch((err) => {
      if (err.name === 'AbortError') throw err; 
      console.error(`API Error [${method} ${endpoint}]:`, err);
      throw new Error('Сервер не отвечает. Попробуйте позже');
    });
}

export function getInitialCards() {
  return makeRequest('/cards');
}

export function getUserInfo() {
  return makeRequest('/users/me');
}

export function updateProfileInfo(name, about) {
  return makeRequest('/users/me', 'PATCH', { name, about });
}

export function addNewCard(name, link) {
  return makeRequest('/cards', 'POST', { name, link });
}

export function deleteCardFromServer(cardId) {
  return makeRequest(`/cards/${cardId}`, 'DELETE');
}

export function likeCard(cardId) {
  return makeRequest(`/cards/likes/${cardId}`, 'PUT');
}

export function unlikeCard(cardId) {
  return makeRequest(`/cards/likes/${cardId}`, 'DELETE');
}

export function updateUserAvatar(avatarUrl) {
  return makeRequest('/users/me/avatar', 'PATCH', { avatar: avatarUrl });
}