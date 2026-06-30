const productoService = require('../services/producto.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

// ruta pública ahora usa listarPublicos (solo activos con Activo_Catalogo=1 y stock>0)
exports.listarPublicos = async (req, res) => {
    try { res.status(200).json(await productoService.listarPublicos()); }
    catch (err) { handleError(res, err); }
};

exports.listar = async (req, res) => {
    try { res.status(200).json(await productoService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.agregar = async (req, res) => {
    try {
        await productoService.agregar(req.body);
        res.status(201).json({ message: 'Producto creado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.actualizar = async (req, res) => {
    try {
        await productoService.actualizar(req.body);
        res.status(200).json({ message: 'Producto actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminar = async (req, res) => {
    try {
        await productoService.eliminar(req.params.id);
        res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};