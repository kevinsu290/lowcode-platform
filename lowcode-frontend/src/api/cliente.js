// lowcode-frontend/src/api/cliente.js
import axios from 'axios';

const cliente = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  headers: { "Content-Type": "application/json" },
});

cliente.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default cliente;