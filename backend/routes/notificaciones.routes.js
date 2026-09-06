/**
 * routes/notificaciones.routes.js
 * Rutas del módulo de notificaciones de CeluAccel.
 *
 * Dos grupos de acceso:
 *   - Admin/Técnico (roles 1 y 3): CRUD completo y envío dirigido
 *   - Cualquier usuario autenticado: consulta y marcado de sus propias notificaciones
 *
 * Endpoints para admin/técnico:
 *   GET    /api/notificaciones/listar         → todas las notificaciones
 *   POST   /api/notificaciones/agregar        → crea una notificación
 *   PUT    /api/notificaciones/actualizar     → edita una notificación
 *   DELETE /api/notificaciones/eliminar/:id   → elimina una notificación
 *   POST   /api/notificaciones/dirigida       → envía notificación a un usuario
 *
 * Endpoints para el usuario autenticado:
 *   GET    /api/notificaciones/mis-notificaciones  → sus notificaciones (?noLeidas=true)
 *   GET    /api/notificaciones/no-leidas/count     → conteo de no leídas (badge)
 *   PUT    /api/notificaciones/marcar-leida/:id    → marca una como leída
 *   PUT    /api/notificaciones/marcar-todas-leidas → marca todas como leídas
 */
const router = require('express').Router();
const notificacionController = require('../controllers/notificacionController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

router.get   ('/notificaciones/listar',            validarToken, notificacionController.listar);
router.post  ('/notificaciones/agregar',           validarToken, validarRol(1, 3), notificacionController.agregar);
router.put   ('/notificaciones/actualizar',        validarToken, validarRol(1, 3), notificacionController.actualizar);
router.delete('/notificaciones/eliminar/:id',      validarToken, validarRol(1, 3), notificacionController.eliminar);

router.post  ('/notificaciones/dirigida',          validarToken, validarRol(1, 3), notificacionController.enviar);

router.get   ('/notificaciones/mis-notificaciones',  validarToken, notificacionController.misNotificaciones);
router.get   ('/notificaciones/listar-mias',         validarToken, notificacionController.misNotificaciones);

router.get   ('/notificaciones/no-leidas/count',     validarToken, notificacionController.contarNoLeidas);

router.put   ('/notificaciones/marcar-leida/:id',    validarToken, notificacionController.marcarLeida);
router.patch ('/notificaciones/marcar-leida/:id',    validarToken, notificacionController.marcarLeida);

router.put   ('/notificaciones/marcar-todas-leidas', validarToken, notificacionController.marcarTodasLeidas);
router.patch ('/notificaciones/marcar-todas-leidas', validarToken, notificacionController.marcarTodasLeidas);

module.exports = router;
