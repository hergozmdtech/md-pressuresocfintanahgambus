// src/config.ts

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL === 'true';

export const getApiBaseUrl = () =>
  USE_LOCAL
    ? import.meta.env.VITE_LOCAL_API
    : import.meta.env.VITE_ONLINE_API;

export const getWebSocketUrl = () =>
  USE_LOCAL
    ? import.meta.env.VITE_LOCAL_WS
    : import.meta.env.VITE_ONLINE_WS;
