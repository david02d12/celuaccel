/**
 * controllers/historialController.js
 * Controlador del historial de servicios técnicos de CeluAccel.
 *
 * El historial registra el seguimiento de cada servicio: cambios de estado,
 * observaciones técnicas y fechas de cada etapa del proceso de reparación.
 *
 * Rutas que lo usan: historial.routes.js
 * Servicio que consume: historial.service.js
 *
 * Endpoints:
 *   GET    /historial/listar        → todos los registros
 *   POST   /historial/agregar       → agrega un registro al historial
 *   PUT    /historial/actualizar    → actualiza un registro
 *   DELETE /historial/eliminar/:id  → elimina un registro
 */
const historialService = require('../services/historial.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listarHistorial = async (req, res) => {
    try { res.status(200).json(await historialService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.agregarHistorial = async (req, res) => {
    try {
        await historialService.agregar(req.body);
        res.status(201).json({ message: 'Historial registrado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.actualizarHistorial = async (req, res) => {
    try {
        await historialService.actualizar(req.body);
        res.status(200).json({ message: 'Historial actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminarHistorial = async (req, res) => {
    try {
        await historialService.eliminar(req.params.id);
        res.status(200).json({ message: 'Historial eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};