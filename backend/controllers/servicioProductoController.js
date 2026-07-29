const spService = require('../services/servicio_producto.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

/** RF-015: Lista repuestos de un servicio */
exports.listarPorServicio = async (req, res) => {
    try { res.status(200).json(await spService.listarPorServicio(req.params.idServicio)); }
    catch (err) { handleError(res, err); }
};

/** RF-015: Registra un repuesto usado en un servicio y descuenta stock */
exports.agregar = async (req, res) => {
    try {
        const result = await spService.agregar(req.body);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

/** RF-015: Elimina registro de repuesto de un servicio */
exports.eliminar = async (req, res) => {
    try {
        await spService.eliminar(req.params.idServicio, req.params.codigoProducto);
        res.status(200).json({ message: 'Repuesto eliminado del servicio.' });
    } catch (err) { handleError(res, err); }
};
