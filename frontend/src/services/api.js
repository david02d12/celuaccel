/**
 * api.js — Instancia centralizada de axios para el frontend.
 *
 * - Todas las llamadas al backend pasan por aquí.
 * - La URL base se lee de la variable de entorno VITE_API_URL.
 * - El interceptor adjunta el token JWT automáticamente en cada request.
 *
 * Uso en un service:
 *   import API from './api';
 *   const data = await API.get('/productos/listar');
 */
import axios from 'axios';

// Instancia centralizada apuntando a la URL del backend en Render
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://celuaccel-1.onrender.com',
    withCredentials: true
});

// Interceptor de request: agrega el token JWT si existe
API.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response: manejo global de 401 (token expirado/inválido)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const teniaToken = !!sessionStorage.getItem('token');
            if (teniaToken) {
                sessionStorage.clear();
                window.dispatchEvent(new CustomEvent('sessionExpired'));
            }
        }
        return Promise.reject(error);
    }
);

export default API;