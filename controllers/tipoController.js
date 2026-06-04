const tipoService = require('../services/tipodocumento.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listarDocumentos = async (req, res) => {
    try { res.status(200).json(await tipoService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.agregarDocumento = async (req, res) => {
    try {
        await tipoService.agregar(req.body);
        res.status(201).json({ message: 'Tipo de documento creado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.actualizarDocumento = async (req, res) => {
    try {
        await tipoService.actualizar(req.body);
        res.status(200).json({ message: 'Tipo de documento actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminarDocumento = async (req, res) => {
    try {
        await tipoService.eliminar(req.params.id);
        res.status(200).json({ message: 'Tipo de documento eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};