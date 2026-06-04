const chatService = require('../services/chat.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await chatService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.listarMios = async (req, res) => {
    try { res.status(200).json(await chatService.listarMios(req.userId)); }
    catch (err) { handleError(res, err); }
};

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