/**
 * servicio.service.js — Frontend
 * Encapsula todas las llamadas al API de servicios técnicos.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/servicios/listar');
    return data;
};

export const listarMios = async () => {
    const { data } = await api.get('/servicios/listar-mios');
    return data;
};

export const crear = async (payload) => {
    const { data } = await api.post('/servicios/crear', payload);
    return data;
};

export const actualizar = async (id, payload) => {
    const { data } = await api.put(`/servicios/actualizar/${id}`, payload);
    return data;
};

export const cancelar = async (id) => {
    const { data } = await api.put(`/servicios/cancelar/${id}`);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/servicios/eliminar/${id}`);
    return data;
};
