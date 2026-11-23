import { configureStore, createSlice } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';

const storage = {
  async getItem(key) {
    return localStorage.getItem(key);
  },
  async setItem(key, value) {
    localStorage.setItem(key, value);
  },
  async removeItem(key) {
    localStorage.removeItem(key);
  },
};

const auth = createSlice({
  name: 'auth',
  initialState: { user: null, verified: false, pending: true, error: '' },
  reducers: {
    started(state) {
      state.pending = true;
      state.error = '';
    },
    resolved(state, { payload }) {
      state.user = payload;
      state.verified = true;
      state.pending = false;
    },
    failed(state, { payload }) {
      state.pending = false;
      state.error = payload;
    },
  },
});

export const store = configureStore({
  reducer: {
    auth: persistReducer({ key: 'auth', storage, whitelist: ['user'] }, auth.reducer),
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
  }),
});

export const persistor = persistStore(store);

export function authRequest(operation, fields = {}) {
  return async (dispatch) => {
    dispatch(auth.actions.started());
    try {
      const options = operation === 'me' ? {} : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      };
      const response = await fetch(`/api/auth/${operation}`, options);
      if (response.status === 204 || (operation === 'me' && response.status === 401)) {
        dispatch(auth.actions.resolved(null));
        return;
      }
      if (response.ok) {
        const { user } = await response.json();
        dispatch(auth.actions.resolved(user));
        return true;
      }

      const messages = {
        400: 'Kiritilgan maʼlumotlarni tekshiring.',
        401: operation === 'login' ? 'Foydalanuvchi nomi, e-pochta yoki parol xato.' : 'Sessiya tugadi. Sahifani yangilang va qayta kiring.',
        409: 'Bu foydalanuvchi nomi yoki e-pochta band.',
        413: 'Profil rasmi juda katta.',
        429: 'Urinishlar soni oshib ketdi. Birozdan soʻng qayta urinib ko‘ring.',
      };
      dispatch(auth.actions.failed(messages[response.status] || 'Serverda xatolik yuz berdi.'));
      return false;
    } catch {
      dispatch(auth.actions.failed('Server bilan bogʻlanib boʻlmadi. Qayta urinib koʻring.'));
      return false;
    }
  };
}
