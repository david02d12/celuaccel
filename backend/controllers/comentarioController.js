const comentarioService = require('../services/comentario.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await comentarioService.listar()); }
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