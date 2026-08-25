/**
 * controllers/chatController.js
 * Controlador del módulo de chat entre usuarios y técnicos.
 *
 * Gestiona la creación, consulta y eliminación de salas de chat.
 * Cada sala corresponde a un servicio técnico activo.
 *
 * Rutas que lo usan: chats.routes.js
 * Servicio que consume: chat.service.js
 *
 * Endpoints:
 *   GET  /chats/listar        → lista todos los chats (técnico/admin)
 *   GET  /chats/mis-chats     → chats del usuario autenticado
 *   POST /chats/agregar       → crea o retorna el chat existente para un servicio
 *   PUT  /chats/actualizar    → actualiza datos del chat
 *   DELETE /chats/eliminar/:id → elimina un chat
 */
const chatService = require('../services/chat.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await chatService.listar(req.userRol)); }
    catch (err) { handleError(res, err); }
};

exports.listarMios = async (req, res) => {
    try { res.status(200).json(await chatService.listarMios(req.userId)); }
    catch (err) { handleError(res, err); }
};

// Si ya existe un chat para el servicio, lo retorna (status 200); si no, lo crea (status 201)
exports.agregar = async (req, res) => {
    try {
        const result = await chatService.agregar(req.body);
        res.status(result.existente ? 200 : 201).json(result);
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await chatService.actualizar(req.body);
        res.status(200).json({ message: 'Chat actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await chatService.eliminar(req.params.id);
        res.status(200).json({ message: 'Chat eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};