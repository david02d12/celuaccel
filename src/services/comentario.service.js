/**
 * comentario.service.js — Frontend
 * Encapsula todas las llamadas al API de comentarios.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/comentarios/listar');
    return data;
};

export const crear = async (payload) => {
    const { data } = await api.post('/comentarios/crear', payload);
    return data;
};

export const actualizar = async (id, payload) => {
    const { data } = await api.put(`/comentarios/actualizar/${id}`, payload);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/comentarios/eliminar/${id}`);
    return data;
};
