const router = require('express').Router();
const ctrl = require('../controllers/servicioProductoController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

/** RF-015: Repuestos usados en un servicio */
router.get('/servicios-productos/:idServicio',              validarToken,              ctrl.listarPorServicio);
router.post('/servicios-productos/agregar',                 validarToken, validarRol(1, 3), ctrl.agregar);
router.delete('/servicios-productos/:idServicio/:codigoProducto', validarToken, validarRol(1, 3), ctrl.eliminar);

module.exports = router;
