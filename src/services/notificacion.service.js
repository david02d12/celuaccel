/**
 * notificacion.service.js — Frontend
 * Encapsula todas las llamadas al API de notificaciones.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/notificaciones/listar');
    return data;
};

export const listarMias = async () => {
    const { data } = await api.get('/notificaciones/listar-mias');
    return data;
};

export const crear = async (payload) => {
    const { data } = await api.post('/notificaciones/crear', payload);
    return data;
};

export const marcarLeida = async (id) => {
    const { data } = await api.put(`/notificaciones/marcar-leida/${id}`);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/notificaciones/eliminar/${id}`);
    return data;
};
