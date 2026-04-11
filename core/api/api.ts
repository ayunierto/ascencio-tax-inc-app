import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL;
// Normaliza para asegurar que incluya la versión /v1 al final.
if (!rawBaseUrl) {
  throw new Error('EXPO_PUBLIC_API_URL is not set in environment variables');
}

const baseURL = `${rawBaseUrl.replace(/\/$/, '')}`;

const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  const access_token = await SecureStore.getItemAsync('access_token');
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

export { api };
