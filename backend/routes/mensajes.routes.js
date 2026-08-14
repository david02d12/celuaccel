const router = require('express').Router();
const path = require('path');
const mensajeController = require('../controllers/mensajeController');
const { validarToken } = require('../middlewares/authMiddleware');
const filtrarContenido = require('../middlewares/filtrarContenido');
const upload = require('../middlewares/upload.middleware');

router.get('/mensajes/listar',             validarToken, mensajeController.listar);
router.get('/mensajes/por-chat/:id',       validarToken, mensajeController.listarPorChat);
router.post('/mensajes/agregar',           validarToken, filtrarContenido, mensajeController.agregar);
router.put('/mensajes/actualizar',         validarToken, mensajeController.actualizar);
router.delete('/mensajes/eliminar/:id',    validarToken, mensajeController.eliminar);

/** EP-005: Subir adjunto/evidencia fotográfica al chat (máx. 3 archivos, 5 MB c/u) */
router.post(
    '/mensajes/adjunto',
    validarToken,
    upload.array('adjuntos', 3),
    mensajeController.subirAdjunto
);

module.exports = router;
