const proveedorService = require('../services/proveedor.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

// ── Proveedores ───────────────────────────────────────────────────────────────

exports.listarProveedores = async (req, res) => {
    try { res.status(200).json(await proveedorService.listarProveedores()); }
    catch (err) { handleError(res, err); }
};

exports.agregarProveedor = async (req, res) => {
    try {
        const result = await proveedorService.agregarProveedor(req.body);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

exports.actualizarProveedor = async (req, res) => {
    try {
        await proveedorService.actualizarProveedor(req.body);
        res.status(200).json({ message: 'Proveedor actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminarProveedor = async (req, res) => {
    try {
        await proveedorService.eliminarProveedor(req.params.id);
        res.status(200).json({ message: 'Proveedor eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};

// ── Compras ───────────────────────────────────────────────────────────────────

exports.listarCompras = async (req, res) => {
    try { res.status(200).json(await proveedorService.listarCompras()); }
    catch (err) { handleError(res, err); }
};

exports.comprasPorProveedor = async (req, res) => {
    try { res.status(200).json(await proveedorService.comprasPorProveedor(req.params.id)); }
    catch (err) { handleError(res, err); }
};

exports.registrarCompra = async (req, res) => {
    try {
        const result = await proveedorService.registrarCompra(req.body);
        res.status(201).json(result);
    } catch (err) { handleError(res, err); }
};

exports.eliminarCompra = async (req, res) => {
    try {
        await proveedorService.eliminarCompra(req.params.id);
        res.status(200).json({ message: 'Compra eliminada correctamente.' });
    } catch (err) { handleError(res, err); }
};
