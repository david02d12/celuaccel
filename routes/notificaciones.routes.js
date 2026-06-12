const router = require('express').Router();
const notificacionController = require('../controllers/notificacionController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

// ─── CRUD admin/técnico ───────────────────────────────────────────────────────
router.get   ('/notificaciones/listar',            validarToken, notificacionController.listar);
router.post  ('/notificaciones/agregar',           validarToken, validarRol(1, 3), notificacionController.agregar);
router.put   ('/notificaciones/actualizar',        validarToken, validarRol(1, 3), notificacionController.actualizar);
router.delete('/notificaciones/eliminar/:id',      validarToken, validarRol(1, 3), notificacionController.eliminar);

// ─── Envío de notificaciones dirigidas (técnico/admin) ───────────────────────
router.post  ('/notificaciones/enviar',            validarToken, validarRol(1, 3), notificacionController.enviar);

// ─── Notificaciones del usuario autenticado ──────────────────────────────────
// ?noLeidas=true → solo devuelve las no leídas
router.get   ('/notificaciones/mis-notificaciones',  validarToken, notificacionController.misNotificaciones);
router.get   ('/notificaciones/listar-mias',         validarToken, notificacionController.misNotificaciones);

// Conteo de no leídas (para badge/indicador en el frontend)
router.get   ('/notificaciones/no-leidas/count',     validarToken, notificacionController.contarNoLeidas);

// Marcar como leída
router.put   ('/notificaciones/marcar-leida/:id',    validarToken, notificacionController.marcarLeida);
router.patch ('/notificaciones/marcar-leida/:id',    validarToken, notificacionController.marcarLeida);

// Marcar TODAS como leídas
router.put   ('/notificaciones/marcar-todas-leidas', validarToken, notificacionController.marcarTodasLeidas);
router.patch ('/notificaciones/marcar-todas-leidas', validarToken, notificacionController.marcarTodasLeidas);

module.exports = router;
