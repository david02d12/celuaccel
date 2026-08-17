/**
 * controllers/productoController.js
 * Controlador del catálogo de productos de CeluAccel.
 *
 * Los productos son repuestos y accesorios usados en los servicios técnicos.
 * Incluye un endpoint público (sin autenticación) para el catálogo de la tienda,
 * que solo muestra productos con stock > 0 y activos en catálogo.
 *
 * Rutas que lo usan: productos.routes.js
 * Servicio que consume: producto.service.js
 *
 * Endpoints:
 *   GET    /productos/publicos        → productos activos con stock (sin autenticación)
 *   GET    /productos/listar          → todos los productos (técnico/admin)
 *   POST   /productos/agregar         → crea un producto
 *   PUT    /productos/actualizar      → actualiza un producto
 *   DELETE /productos/eliminar/:id    → elimina un producto
 *   PATCH  /productos/stock/:id       → descuenta stock de un producto (valida stock > 0)
 */
const productoService = require('../services/producto.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

// Solo productos con Activo_Catalogo=1 y stock > 0 (ruta pública del catálogo)
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

// Descuenta la cantidad indicada del stock; rechaza si el stock actual es 0
exports.descontarStock = async (req, res) => {
    try {
        const { cantidad } = req.body;
        const result = await productoService.descontarStock(req.params.id, Number(cantidad) || 1);
        res.status(200).json(result);
    } catch (err) { handleError(res, err); }
};