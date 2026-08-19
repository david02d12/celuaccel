/**
 * controllers/authController.js
 * Controlador de autenticación y gestión de perfil de usuario.
 *
 * Maneja las peticiones HTTP relacionadas con:
 *   - Registro e inicio de sesión de usuarios
 *   - Recuperación y cambio de contraseña
 *   - Consulta y edición de perfil propio y público
 *
 * Rutas que lo usan: auth.routes.js, usuarios.routes.js
 * Servicios que consume: auth.service.js, usuario.service.js, passwordReset.service.js
 */
const authService = require('../services/auth.service');
const usuarioService = require('../services/usuario.service');
const passwordResetService = require('../services/passwordReset.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

// Registra un nuevo usuario en el sistema
exports.registro = async (req, res) => {
    try {
        await authService.registro(req.body);
        res.status(201).json({ message: 'Usuario creado exitosamente.' });
    } catch (err) { handleError(res, err); }
};

// Inicia sesión y devuelve un token JWT
exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body.user, req.body.password);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ auth: false, message: err.message || 'Error interno.' });
    }
};

// Lista todos los usuarios (uso administrativo)
exports.listar = async (req, res) => {
    try {
        const data = await usuarioService.listar();
        res.status(200).json(data);
    } catch (err) { handleError(res, err); }
};

// Actualiza los datos de un usuario (uso administrativo)
exports.actualizar = async (req, res) => {
    try {
        await usuarioService.actualizar(req.body, req.userId);
        res.status(200).json({ message: 'Usuario actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

// Elimina un usuario por su ID
exports.eliminar = async (req, res) => {
    try {
        await usuarioService.eliminar(req.params.id);
        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};

// Devuelve el perfil público de un usuario por su ID
exports.perfilPublico = async (req, res) => {
    try {
        const perfil = await usuarioService.perfilPublico(req.params.id, req.userId);
        res.status(200).json(perfil);
    } catch (err) { handleError(res, err); }
};

// Actualiza el perfil del usuario autenticado
exports.actualizarMiPerfil = async (req, res) => {
    try {
        await usuarioService.actualizarMiPerfil(req.userId, req.body);
        res.status(200).json({ message: 'Perfil actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

// Envía el correo de recuperación de contraseña
exports.forgotPassword = async (req, res) => {
    try {
        await passwordResetService.forgotPassword(req.body.email);
        res.status(200).json({ message: 'Correo enviado para recuperar contraseña.' });
    } catch (err) { handleError(res, err); }
};

// Restablece la contraseña usando el token del correo
exports.resetPassword = async (req, res) => {
    try {
        await passwordResetService.resetPassword(req.params.token, req.body.newPassword);
        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) { handleError(res, err); }
};

// Cambia la contraseña del usuario autenticado (requiere la contraseña actual)
exports.changePassword = async (req, res) => {
    try {
        await authService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
        res.status(200).json({ message: 'Contraseña cambiada correctamente.' });
    } catch (err) { handleError(res, err); }
};
