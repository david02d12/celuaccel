const router = require('express').Router();
const servicioController = require('../controllers/servicioController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

router.get('/servicios/listar',                   validarToken,                  servicioController.listar);
router.get('/servicios/listar-mios',              validarToken,                  servicioController.listarMios);
router.get('/servicios/mis-servicios/:idUsuario', validarToken,                  servicioController.misServicios);
router.post('/servicios/crear',                   validarToken,                  servicioController.agregar);
router.post('/servicios/agregar',                 validarToken,                  servicioController.agregar);
router.put('/servicios/actualizar',               validarToken, validarRol(1, 3), servicioController.actualizar);
router.put('/servicios/cancelar/:id',             validarToken,                  servicioController.cancelar);
router.patch('/servicios/cancelar/:id',           validarToken,                  servicioController.cancelar);
router.delete('/servicios/eliminar/:id',          validarToken, validarRol(1, 3), servicioController.eliminar);

module.exports = router;
