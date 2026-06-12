/**
 * notificacion.service.js — Frontend
 * Encapsula todas las llamadas al API de notificaciones.
 */
import api from './api';

/** Lista todas las notificaciones (admin/técnico) */
export const listar = async () => {
    const { data } = await api.get('/notificaciones/listar');
    return data;
};

/** Lista las notificaciones del usuario autenticado */
export const listarMias = async (soloNoLeidas = false) => {
    const url = soloNoLeidas
        ? '/notificaciones/mis-notificaciones?noLeidas=true'
        : '/notificaciones/mis-notificaciones';
    const { data } = await api.get(url);
    return data;
};

/** Obtiene el conteo de notificaciones no leídas (para badge) */
export const contarNoLeidas = async () => {
    const { data } = await api.get('/notificaciones/no-leidas/count');
    return data; // { total: number }
};

/**
 * Envía una notificación dirigida a un usuario (técnico/admin).
 * @param {{ ID_Usuario_Destino: string, ID_Servicio?: number, Mensaje: string }} payload
 */
export const enviar = async (payload) => {
    const { data } = await api.post('/notificaciones/enviar', payload);
    return data;
};

/** Marca una notificación específica como leída */
export const marcarLeida = async (id) => {
    const { data } = await api.patch(`/notificaciones/marcar-leida/${id}`, {});
    return data;
};

/** Marca TODAS las notificaciones del usuario como leídas */
export const marcarTodasLeidas = async () => {
    const { data } = await api.patch('/notificaciones/marcar-todas-leidas', {});
    return data;
};

/** Actualiza el texto de una notificación (CRUD admin) */
export const actualizar = async (payload) => {
    const { data } = await api.put('/notificaciones/actualizar', payload);
    return data;
};

/** Elimina una notificación por ID */
export const eliminar = async (id) => {
    const { data } = await api.delete(`/notificaciones/eliminar/${id}`);
    return data;
};
