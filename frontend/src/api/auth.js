import { api } from './client';

// Both return { message, user, token }
export const loginRequest = (form) => api.post('/user/login', form);

export const registerRequest = (form) => api.post('/user/register', form);
