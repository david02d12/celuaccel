const router = require('express').Router();
const productoController = require('../controllers/productoController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

router.get('/productos/listar',          validarToken,              productoController.listar);
router.post('/productos/agregar',        validarToken, validarRol(1, 3), productoController.agregar);
router.put('/productos/actualizar',      validarToken, validarRol(1, 3), productoController.actualizar);
router.delete('/productos/eliminar/:id', validarToken, validarRol(1, 3), productoController.eliminar);

module.exports = router;
