// Shared API client for every page. Usage:
//   const data = await api.get('/posts');
//   await api.post(`/posts/${id}/like`);
//   await api.post('/posts', formData);      // FormData for image upload
//   <img src={imageUrl(post.image)} />
// Errors are thrown as Error(message) — show err.message to the user.
import { store } from '../store';
import { logout } from '../store/authSlice';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// "/images/abc" -> "http://localhost:8000/images/abc"; full URLs stay as they are
export const imageUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_URL}${path}`;
};

const request = async (method, path, body) => {
  const { token } = store.getState().auth;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const isForm = body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error("Serverga ulanib bo'lmadi. Backend ishga tushganini tekshiring.");
  }

  const data = await response.json().catch(() => ({}));

  // Token missing, expired or invalid: log out so the user can sign in again
  if (response.status === 401 && store.getState().auth.isAuthenticated) {
    store.dispatch(logout());
  }
  if (!response.ok) {
    throw new Error(data.message || 'Nimadir xato ketdi');
  }
  return data;
};

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
