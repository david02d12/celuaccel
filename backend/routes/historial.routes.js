const router = require('express').Router();
const historialController = require('../controllers/historialController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

router.get('/historial/listar',          validarToken,              historialController.listarHistorial);
router.post('/historial/agregar',        validarToken, validarRol(1, 3), historialController.agregarHistorial);
router.put('/historial/actualizar',      validarToken, validarRol(1, 3), historialController.actualizarHistorial);
router.delete('/historial/eliminar/:id', validarToken, validarRol(1, 3), historialController.eliminarHistorial);

module.exports = router;
