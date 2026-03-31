import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL;
// Normaliza para asegurar que incluya la versión /v1 al final.
const baseURL = rawBaseUrl
  ? `${rawBaseUrl.replace(/\/$/, '')}${rawBaseUrl.endsWith('/v1') ? '' : '/v1'}`
  : 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(async (config) => {
  const access_token = await SecureStore.getItemAsync('access_token');
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

export { api };
