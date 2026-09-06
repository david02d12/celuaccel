/**
 * roles.service.js — Frontend
 * Encapsula todas las llamadas al API de roles.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/roles/listar');
    return data;
};

export const crear = async (payload) => {
    const { data } = await api.post('/roles/crear', payload);
    return data;
};

export const actualizar = async (id, payload) => {
    const { data } = await api.put(`/roles/actualizar/${id}`, payload);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/roles/eliminar/${id}`);
    return data;
};
