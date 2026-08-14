const mensajeService = require('../services/mensaje.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listar = async (req, res) => {
    try { res.status(200).json(await mensajeService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        const result = await mensajeService.agregar(req.body);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await mensajeService.actualizar(req.body, req.userId);
        res.status(200).json({ message: 'Mensaje actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await mensajeService.eliminar(req.params.id, req.userId);
        res.status(200).json({ message: 'Mensaje eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.listarPorChat = async (req, res) => {
    try {
        res.status(200).json(await mensajeService.listarPorChat(req.params.id));
    } catch (err) { handleError(res, err); }
};

/** EP-005: Procesa adjuntos subidos con Multer y retorna sus URLs pública */
exports.subirAdjunto = (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se recibieron archivos.' });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const archivos = req.files.map(f => ({
            nombre:   f.originalname,
            url:      `${baseUrl}/uploads/chat/${f.filename}`,
            tipo:     f.mimetype,
            tamano:   f.size,
        }));
        res.status(201).json({ message: 'Archivo(s) subido(s) correctamente.', archivos });
    } catch (err) { handleError(res, err); }
};