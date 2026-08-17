/**
 * controllers/preguntaController.js
 * Controlador de preguntas y respuestas frecuentes de CeluAccel.
 *
 * Los usuarios pueden enviar consultas sobre servicios o productos,
 * y los técnicos las responden. El módulo funciona como un FAQ dinámico.
 *
 * Rutas que lo usan: preguntas.routes.js
 * Servicio que consume: pregunta.service.js
 *
 * Endpoints:
 *   GET    /preguntas/listar           → todas las preguntas (técnico/admin)
 *   GET    /preguntas/mias             → preguntas del usuario autenticado
 *   POST   /preguntas/agregar          → el usuario envía una pregunta
 *   PUT    /preguntas/actualizar       → edita una pregunta
 *   DELETE /preguntas/eliminar/:id     → elimina una pregunta
 *   PUT    /preguntas/responder/:id    → el técnico registra la respuesta
 */
const preguntaService = require('../services/pregunta.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await preguntaService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.listarMias = async (req, res) => {
    try { res.status(200).json(await preguntaService.listarMias(req.userId)); }
    catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        await preguntaService.agregar(req.body, req.userId);
        res.status(201).json({ message: 'Pregunta registrada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await preguntaService.actualizar(req.body);
        res.status(200).json({ message: 'Pregunta actualizada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await preguntaService.eliminar(req.params.id);
        res.status(200).json({ message: 'Pregunta eliminada correctamente.' });
    } catch (err) { handleError(res, err); }
};

// El técnico registra la respuesta a una pregunta de un usuario
exports.responder = async (req, res) => {
    try {
        await preguntaService.responder(
            { ID_Consulta: req.params.id, Respuesta: req.body.Respuesta },
            req.userId
        );
        res.status(200).json({ message: 'Respuesta registrada correctamente.' });
    } catch (err) { handleError(res, err); }
};