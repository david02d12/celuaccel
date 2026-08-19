/**
 * routes/mensajes.routes.js
 * Rutas del módulo de mensajes del chat de CeluAccel.
 *
 * Todas las rutas requieren token JWT.
 * La ruta de agregar aplica el middleware de moderación (filtrarContenido).
 * La ruta de adjuntos usa Multer para recibir hasta 3 archivos de hasta 5 MB c/u.
 *
 * Endpoints:
 *   GET    /api/mensajes/listar        → todos los mensajes
 *   GET    /api/mensajes/por-chat/:id  → mensajes de un chat específico
 *   POST   /api/mensajes/agregar       → envía un mensaje (pasa por filtro de contenido)
 *   PUT    /api/mensajes/actualizar    → edita un mensaje
 *   DELETE /api/mensajes/eliminar/:id  → elimina un mensaje
 *   POST   /api/mensajes/adjunto       → sube archivos adjuntos al chat
 */
const router = require('express').Router();
const mensajeController = require('../controllers/mensajeController');
const { validarToken } = require('../middlewares/authMiddleware');
const filtrarContenido = require('../middlewares/filtrarContenido');
const upload = require('../middlewares/upload.middleware');

router.get('/mensajes/listar',             validarToken, mensajeController.listar);
router.get('/mensajes/por-chat/:id',       validarToken, mensajeController.listarPorChat);
router.post('/mensajes/agregar',           validarToken, filtrarContenido, mensajeController.agregar);
router.put('/mensajes/actualizar',         validarToken, mensajeController.actualizar);
router.delete('/mensajes/eliminar/:id',    validarToken, mensajeController.eliminar);
router.put('/mensajes/leidos/:id',         validarToken, mensajeController.marcarLeidos);

router.post(
    '/mensajes/adjunto',
    validarToken,
    upload.array('adjuntos', 3),
    mensajeController.subirAdjunto
);

module.exports = router;
