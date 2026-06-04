const notificacionService = require('../services/notificacion.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await notificacionService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.enviar = async (req, res) => {
    try {
        const result = await notificacionService.enviar(req.body, req.userId);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

exports.misNotificaciones = async (req, res) => {
    try { res.status(200).json(await notificacionService.misNotificaciones(req.userId)); }
    catch (err) { handleError(res, err); }
};

exports.marcarLeida = async (req, res) => {
    try {
        await notificacionService.marcarLeida(req.params.id, req.userId);
        res.status(200).json({ message: 'Marcada como leída.' });
    } catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        await notificacionService.agregar(req.body);
        res.status(201).json({ message: 'Notificación creada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await notificacionService.actualizar(req.body);
        res.status(200).json({ message: 'Notificación actualizada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await notificacionService.eliminar(req.params.id);
        res.status(200).json({ message: 'Notificación eliminada correctamente.' });
    } catch (err) { handleError(res, err); }
};