const servicioService = require('../services/servicio.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await servicioService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.misServicios = async (req, res) => {
    try {
        const data = await servicioService.misServicios(req.params.idUsuario, req.userId);
        res.status(200).json(data);
    } catch (err) { handleError(res, err); }
};

exports.listarMios = async (req, res) => {
    try {
        const data = await servicioService.misServicios(req.userId, req.userId);
        res.status(200).json(data);
    } catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        const result = await servicioService.agregar(req.body, req.userId);
        res.status(201).json({ message: 'Servicio registrado correctamente.', id: result.insertId });
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await servicioService.actualizar(req.body);
        res.status(200).json({ message: 'Servicio actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.cancelar = async (req, res) => {
    try {
        await servicioService.cancelar(req.params.id, req.userId);
        res.status(200).json({ message: 'Servicio cancelado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await servicioService.eliminar(req.params.id);
        res.status(200).json({ message: 'Servicio eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};