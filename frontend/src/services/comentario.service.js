/**
 * comentario.service.js — Frontend
 * Encapsula todas las llamadas al API de comentarios.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/comentarios/listar');
    return data;
};

/** @param {{ ID_Usuario, Comentario, Estrellas, Fecha_Comentario }} payload */
export const crear = async (payload) => {
    const { data } = await api.post('/comentarios/agregar', payload);
    return data;
};

/** @param {{ Codigo_Comentario, Comentario, Estrellas, Fecha_Comentario }} payload */
export const actualizar = async (payload) => {
    const { data } = await api.put('/comentarios/actualizar', payload);
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/comentarios/eliminar/${id}`);
    return data;
};
