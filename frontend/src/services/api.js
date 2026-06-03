/**
 * api.js — Instancia centralizada de axios para el frontend.
 *
 * - Todas las llamadas al backend pasan por aquí.
 * - La URL base se lee de la variable de entorno VITE_API_URL.
 * - El interceptor adjunta el token JWT automáticamente en cada request.
 * - No hay que copiar el token en cada componente.
 *
 * Uso en un service:
 *   import api from './api';
 *   const data = await api.get('/productos/listar');
 */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request: agrega el token JWT si existe
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response: manejo global de 401 (token expirado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
