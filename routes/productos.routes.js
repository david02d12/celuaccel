const router = require('express').Router();
const productoController = require('../controllers/productoController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

// B5 FIX: Solo muestra productos activos con stock > 0 (sin autenticación)
router.get('/productos/publico',         productoController.listarPublicos);

// Rutas protegidas
router.get('/productos/listar',          validarToken,              productoController.listar);
router.post('/productos/agregar',        validarToken, validarRol(1, 3), productoController.agregar);
router.put('/productos/actualizar',      validarToken, validarRol(1, 3), productoController.actualizar);
router.delete('/productos/eliminar/:id', validarToken, validarRol(1, 3), productoController.eliminar);

module.exports = router;
