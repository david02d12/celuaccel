const garantiaService = require('../services/garantia.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

/** RF-022: Lista todas las garantías (admin/técnico) */
exports.listar = async (req, res) => {
    try { res.status(200).json(await garantiaService.listar()); }
    catch (err) { handleError(res, err); }
};

/** RF-022: Garantías del cliente autenticado */
exports.misGarantias = async (req, res) => {
    try { res.status(200).json(await garantiaService.misGarantias(req.userId)); }
    catch (err) { handleError(res, err); }
};

/** RF-022: Garantías de un servicio específico */
exports.listarPorServicio = async (req, res) => {
    try { res.status(200).json(await garantiaService.listarPorServicio(req.params.id)); }
    catch (err) { handleError(res, err); }
};

/** RF-022: Verifica si un servicio tiene garantía vigente */
exports.verificarVigencia = async (req, res) => {
    try { res.status(200).json(await garantiaService.verificarVigencia(req.params.id)); }
    catch (err) { handleError(res, err); }
};

/** RF-022: Crea una garantía */
exports.crear = async (req, res) => {
    try {
        const result = await garantiaService.crear(req.body, req.userId);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

/** RF-022: Actualiza una garantía */
exports.actualizar = async (req, res) => {
    try {
        await garantiaService.actualizar(req.body);
        res.status(200).json({ message: 'Garantía actualizada correctamente.' });
    } catch (err) { handleError(res, err); }
};

/** RF-022: Elimina una garantía (solo admin) */
exports.eliminar = async (req, res) => {
    try {
        await garantiaService.eliminar(req.params.id);
        res.status(200).json({ message: 'Garantía eliminada.' });
    } catch (err) { handleError(res, err); }
};
