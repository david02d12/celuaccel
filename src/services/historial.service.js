/**
 * historial.service.js — Frontend
 * Encapsula todas las llamadas al API de historial de servicios.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/historial/listar');
    return data;
};

export const agregar = async (payload) => {
    const { data } = await api.post('/historial/agregar', payload);
    return data;
};
