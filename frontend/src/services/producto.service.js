/**
 * producto.service.js — Frontend
 * Encapsula todas las llamadas al API de productos.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/productos/listar');
    return data;
};

export const agregar = async (payload) => {
    const { data } = await api.post('/productos/agregar', payload);
    return data;
};

export const actualizar = async (id, payload) => {
    const { data } = await api.put(`/productos/actualizar/${id}`, payload);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/productos/eliminar/${id}`);
    return data;
};
