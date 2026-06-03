/**
 * chat.service.js — Frontend
 * Encapsula todas las llamadas al API de chats.
 */
import api from './api';

export const listarMios = async () => {
    const { data } = await api.get('/chats/listar-mios');
    return data;
};

export const listarTodos = async () => {
    const { data } = await api.get('/chats/listar');
    return data;
};

export const crear = async (payload) => {
    const { data } = await api.post('/chats/crear', payload);
    return data;
};
