/**
 * mensaje.service.js — Frontend
 * Encapsula todas las llamadas al API de mensajes de chat.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/mensajes/listar');
    return data;
};

export const listarPorChat = async (idChat) => {
    const { data } = await api.get(`/mensajes/listar/${idChat}`);
    return data;
};

export const crear = async (payload) => {
    const { data } = await api.post('/mensajes/crear', payload);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/mensajes/eliminar/${id}`);
    return data;
};
