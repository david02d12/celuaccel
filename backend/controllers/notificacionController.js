const notificacionService = require('../services/notificacion.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

// ─── CRUD admin/técnico ───────────────────────────────────────────────────────

exports.listar = async (req, res) => {
    try { res.status(200).json(await notificacionService.listar()); }
    catch (err) { handleError(res, err); }
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

// ─── Notificaciones dirigidas ─────────────────────────────────────────────────

/** Envía una notificación a un usuario (técnico/admin) */
exports.enviar = async (req, res) => {
    try {
        const result = await notificacionService.enviar(req.body, req.userId);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

/** Devuelve todas las notificaciones del usuario autenticado */
exports.misNotificaciones = async (req, res) => {
    try {
        const soloNoLeidas = req.query.noLeidas === 'true';
        res.status(200).json(await notificacionService.misNotificaciones(req.userId, soloNoLeidas));
    } catch (err) { handleError(res, err); }
};

/** Devuelve el conteo de notificaciones no leídas (para badge) */
exports.contarNoLeidas = async (req, res) => {
    try {
        res.status(200).json(await notificacionService.contarNoLeidas(req.userId));
    } catch (err) { handleError(res, err); }
};

/** Marca una notificación específica como leída */
exports.marcarLeida = async (req, res) => {
    try {
        await notificacionService.marcarLeida(req.params.id, req.userId);
        res.status(200).json({ message: 'Marcada como leída.' });
    } catch (err) { handleError(res, err); }
};

/** Marca TODAS las notificaciones del usuario como leídas */
exports.marcarTodasLeidas = async (req, res) => {
    try {
        await notificacionService.marcarTodasLeidas(req.userId);
        res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas.' });
    } catch (err) { handleError(res, err); }
};