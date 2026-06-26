/**
 * auth.service.js — Frontend
 * Encapsula todas las llamadas al API de autenticación y usuarios.
 */
import api from './api';

/** Iniciar sesión. Devuelve { token, usuario } */
export const login = async (correo, contrasena) => {
    const { data } = await api.post('/login', { correo, contrasena });
    return data;
};

/** Registrar un nuevo usuario */
export const registro = async (payload) => {
    const { data } = await api.post('/registro', payload);
    return data;
};

/** Obtener todos los usuarios (admin) */
export const listarUsuarios = async () => {
    const { data } = await api.get('/usuarios/listar');
    return data;
};

/** Actualizar el propio perfil */
export const actualizarPerfil = async (id, payload) => {
    const { data } = await api.put(`/usuarios/actualizar/${id}`, payload);
    return data;
};

/** Eliminar usuario (admin) */
export const eliminarUsuario = async (id) => {
    const { data } = await api.delete(`/usuarios/eliminar/${id}`);
    return data;
};
