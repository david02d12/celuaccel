/**
 * controllers/notificacionController.js
 * Controlador de notificaciones del sistema CeluAccel.
 *
 * Gestiona dos flujos diferenciados:
 *   1. CRUD administrativo: técnicos y administradores pueden crear, editar
 *      y eliminar notificaciones generales del sistema.
 *   2. Notificaciones del usuario: cada usuario consulta solo las suyas,
 *      puede marcarlas como leídas y ver el conteo de no leídas (badge).
 *
 * Rutas que lo usan: notificaciones.routes.js
 * Servicios que consume: notificacion.service.js, notificacionAdmin.service.js
 *
 * Endpoints:
 *   GET    /notificaciones/listar              → todas (admin/técnico)
 *   POST   /notificaciones/agregar             → crea una notificación (admin/técnico)
 *   PUT    /notificaciones/actualizar          → edita una notificación (admin/técnico)
 *   DELETE /notificaciones/eliminar/:id        → elimina una notificación (admin/técnico)
 *   POST   /notificaciones/dirigida            → envía notificación a un usuario específico
 *   GET    /notificaciones/mis-notificaciones  → notificaciones del usuario autenticado
 *   GET    /notificaciones/no-leidas/count     → conteo de no leídas (para badge)
 *   PUT    /notificaciones/marcar-leida/:id    → marca una como leída
 *   PUT    /notificaciones/marcar-todas-leidas → marca todas como leídas
 */
const notificacionService = require('../services/notificacion.service');
const notificacionAdminService = require('../services/notificacionAdmin.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await notificacionAdminService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        await notificacionAdminService.agregar(req.body);
        res.status(201).json({ message: 'Notificación creada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await notificacionAdminService.actualizar(req.body);
        res.status(200).json({ message: 'Notificación actualizada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await notificacionAdminService.eliminar(req.params.id);
        res.status(200).json({ message: 'Notificación eliminada correctamente.' });
    } catch (err) { handleError(res, err); }
};

// Envía una notificación dirigida a un usuario específico
exports.enviar = async (req, res) => {
    try {
        const result = await notificacionAdminService.enviar(req.body, req.userId);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

// Devuelve las notificaciones del usuario autenticado (?noLeidas=true filtra solo las no leídas)
exports.misNotificaciones = async (req, res) => {
    try {
        const soloNoLeidas = req.query.noLeidas === 'true';
        res.status(200).json(await notificacionService.misNotificaciones(req.userId, soloNoLeidas));
    } catch (err) { handleError(res, err); }
};

// Devuelve el conteo de notificaciones no leídas para mostrar en el badge del frontend
exports.contarNoLeidas = async (req, res) => {
    try {
        res.status(200).json(await notificacionService.contarNoLeidas(req.userId));
    } catch (err) { handleError(res, err); }
};

// Marca una notificación específica como leída
exports.marcarLeida = async (req, res) => {
    try {
        await notificacionService.marcarLeida(req.params.id, req.userId);
        res.status(200).json({ message: 'Marcada como leída.' });
    } catch (err) { handleError(res, err); }
};

// Marca todas las notificaciones del usuario como leídas
exports.marcarTodasLeidas = async (req, res) => {
    try {
        await notificacionService.marcarTodasLeidas(req.userId);
        res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas.' });
    } catch (err) { handleError(res, err); }
};