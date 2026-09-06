/**
 * controllers/comentarioController.js
 * Controlador de comentarios y reseñas de servicios en CeluAccel.
 *
 * Los usuarios dejan valoraciones (con puntuación y texto) sobre los
 * servicios técnicos recibidos. Este controlador gestiona el ciclo
 * completo de las reseñas.
 *
 * Rutas que lo usan: comentarios.routes.js
 * Servicio que consume: comentario.service.js
 * Middleware adicional: filtrarContenido (antes de agregar)
 *
 * Endpoints:
 *   GET    /comentarios/listar        → todos los comentarios
 *   GET    /comentarios/promedio      → promedio de calificaciones
 *   POST   /comentarios/agregar       → publica un comentario
 *   PUT    /comentarios/actualizar    → edita un comentario propio
 *   DELETE /comentarios/eliminar/:id  → elimina un comentario
 */
const comentarioService = require('../services/comentario.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await comentarioService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.promedio = async (req, res) => {
    try { res.status(200).json(await comentarioService.promedio()); }
    catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        const result = await comentarioService.agregar(req.body, req.userId);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await comentarioService.actualizar(req.body, req.userId);
        res.status(200).json({ message: 'Comentario actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await comentarioService.eliminar(req.params.id, req.userId);
        res.status(200).json({ message: 'Comentario eliminado.' });
    } catch (err) { handleError(res, err); }
};