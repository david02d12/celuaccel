/**
 * categoria.service.js — Frontend
 * Encapsula todas las llamadas al API de categorías.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/categorias/listar');
    return data;
};

export const agregar = async (payload) => {
    const { data } = await api.post('/categorias/agregar', payload);
    return data;
};

export const actualizar = async (id, payload) => {
    const { data } = await api.put(`/categorias/actualizar/${id}`, payload);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/categorias/eliminar/${id}`);
    return data;
};
