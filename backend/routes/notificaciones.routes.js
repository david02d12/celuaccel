const router = require('express').Router();
const notificacionController = require('../controllers/notificacionController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

// Catálogo (técnico/admin)
router.get('/notificaciones/listar',          validarToken,              notificacionController.listar);
router.post('/notificaciones/agregar',        validarToken, validarRol(1, 3), notificacionController.agregar);
router.put('/notificaciones/actualizar',      validarToken, validarRol(1, 3), notificacionController.actualizar);
router.delete('/notificaciones/eliminar/:id', validarToken, validarRol(1, 3), notificacionController.eliminar);

// Notificaciones dirigidas
router.post('/notificaciones/enviar',                  validarToken, validarRol(1, 3), notificacionController.enviar);
router.get('/notificaciones/mis-notificaciones',        validarToken,              notificacionController.misNotificaciones);
router.get('/notificaciones/listar-mias',               validarToken,              notificacionController.misNotificaciones);
router.put('/notificaciones/marcar-leida/:id',          validarToken,              notificacionController.marcarLeida);
router.patch('/notificaciones/marcar-leida/:id',        validarToken,              notificacionController.marcarLeida);

module.exports = router;
