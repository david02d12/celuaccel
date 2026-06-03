const authService = require('../services/auth.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.registro = async (req, res) => {
    try {
        await authService.registro(req.body);
        res.status(201).json({ message: 'Usuario creado exitosamente.' });
    } catch (err) { handleError(res, err); }
};

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body.user, req.body.password);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ auth: false, message: err.message || 'Error interno.' });
    }
};

exports.listar = async (req, res) => {
    try {
        const data = await authService.listar();
        res.status(200).json(data);
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await authService.actualizar(req.body);
        res.status(200).json({ message: 'Usuario actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await authService.eliminar(req.params.id);
        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.perfilPublico = async (req, res) => {
    try {
        const perfil = await authService.perfilPublico(req.params.id, req.userId);
        res.status(200).json(perfil);
    } catch (err) { handleError(res, err); }
};

exports.actualizarMiPerfil = async (req, res) => {
    try {
        await authService.actualizarMiPerfil(req.userId, req.body);
        res.status(200).json({ message: 'Perfil actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

/*  NUEVAS FUNCIONES PARA CONTRASEÑAS */

exports.forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.status(200).json({ message: 'Correo enviado para recuperar contraseña.' });
    } catch (err) { handleError(res, err); }
};

exports.resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.params.token, req.body.newPassword);
        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.changePassword = async (req, res) => {
    try {
        await authService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
        res.status(200).json({ message: 'Contraseña cambiada correctamente.' });
    } catch (err) { handleError(res, err); }
};
