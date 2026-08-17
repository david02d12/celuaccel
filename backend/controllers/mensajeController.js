/**
 * controllers/mensajeController.js
 * Controlador de mensajes del chat de CeluAccel.
 *
 * Maneja el envío, edición, eliminación y consulta de mensajes de texto
 * dentro de una sala de chat. También gestiona la subida de archivos
 * adjuntos (imágenes y PDFs) asociados a un mensaje.
 *
 * Rutas que lo usan: mensajes.routes.js
 * Servicio que consume: mensaje.service.js
 * Middleware adicional: filtrarContenido (antes de agregar), upload (antes de subirAdjunto)
 *
 * Endpoints:
 *   GET    /mensajes/listar          → todos los mensajes (admin)
 *   GET    /mensajes/por-chat/:id    → mensajes de un chat específico
 *   POST   /mensajes/agregar         → envía un mensaje de texto
 *   PUT    /mensajes/actualizar      → edita un mensaje existente
 *   DELETE /mensajes/eliminar/:id    → elimina un mensaje
 *   POST   /mensajes/adjunto         → sube archivos al chat (máx. 3, 5 MB c/u)
 */
const mensajeService = require('../services/mensaje.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await mensajeService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        const result = await mensajeService.agregar(req.body);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await mensajeService.actualizar(req.body, req.userId);
        res.status(200).json({ message: 'Mensaje actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await mensajeService.eliminar(req.params.id, req.userId);
        res.status(200).json({ message: 'Mensaje eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.listarPorChat = async (req, res) => {
    try {
        res.status(200).json(await mensajeService.listarPorChat(req.params.id));
    } catch (err) { handleError(res, err); }
};

// Procesa los archivos recibidos por Multer y retorna sus URLs públicas
exports.subirAdjunto = (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se recibieron archivos.' });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const archivos = req.files.map(f => ({
            nombre:   f.originalname,
            url:      `${baseUrl}/uploads/chat/${f.filename}`,
            tipo:     f.mimetype,
            tamano:   f.size,
        }));
        res.status(201).json({ message: 'Archivo(s) subido(s) correctamente.', archivos });
    } catch (err) { handleError(res, err); }
};