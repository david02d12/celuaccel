const categoriaService = require('../services/categoria.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await categoriaService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        await categoriaService.agregar(req.body);
        res.status(201).json({ message: 'Categoría creada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await categoriaService.actualizar(req.body);
        res.status(200).json({ message: 'Categoría actualizada correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await categoriaService.eliminar(req.params.id);
        res.status(200).json({ message: 'Categoría eliminada correctamente.' });
    } catch (err) { handleError(res, err); }
};