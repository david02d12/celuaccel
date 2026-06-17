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