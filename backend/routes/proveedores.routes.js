const router = require('express').Router();
const ctrl = require('../controllers/proveedorController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

/** RF-018: Gestión de Proveedores y Compras — solo admin y técnico */

// ── Proveedores ───────────────────────────────────────────────────────────────
router.get('/proveedores/listar',             validarToken, validarRol(1, 3), ctrl.listarProveedores);
router.post('/proveedores/agregar',           validarToken, validarRol(3),   ctrl.agregarProveedor);
router.put('/proveedores/actualizar',         validarToken, validarRol(3),   ctrl.actualizarProveedor);
router.delete('/proveedores/eliminar/:id',    validarToken, validarRol(3),   ctrl.eliminarProveedor);

// ── Compras de reabastecimiento ────────────────────────────────────────────────
router.get('/compras/listar',                 validarToken, validarRol(1, 3), ctrl.listarCompras);
router.get('/compras/por-proveedor/:id',      validarToken, validarRol(1, 3), ctrl.comprasPorProveedor);
/** Registra la compra E incrementa el stock del producto automáticamente */
router.post('/compras/registrar',             validarToken, validarRol(1, 3), ctrl.registrarCompra);
router.delete('/compras/eliminar/:id',        validarToken, validarRol(3),   ctrl.eliminarCompra);

module.exports = router;
