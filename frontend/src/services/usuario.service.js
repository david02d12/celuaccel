/**
 * usuario.service.js — Frontend
 * Encapsula todas las llamadas al API de gestión de usuarios.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/usuarios/listar');
    return data;
};

export const actualizar = async (id, payload) => {
    const { data } = await api.put(`/usuarios/actualizar/${id}`, payload);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/usuarios/eliminar/${id}`);
    return data;
};
