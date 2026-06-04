/**
 * pregunta.service.js — Frontend
 * Encapsula todas las llamadas al API de preguntas.
 */
import api from './api';

export const listar = async () => {
    const { data } = await api.get('/preguntas/listar');
    return data;
};

export const crear = async (payload) => {
    const { data } = await api.post('/preguntas/crear', payload);
    return data;
};

export const responder = async (id, respuesta) => {
    const { data } = await api.put(`/preguntas/responder/${id}`, { respuesta });
    return data;
};

export const eliminar = async (id) => {
    const { data } = await api.delete(`/preguntas/eliminar/${id}`);
    return data;
};
