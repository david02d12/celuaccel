const router = require('express').Router();

router.use(require('./auth.routes'));
router.use(require('./usuarios.routes'));
router.use(require('./roles.routes'));
router.use(require('./servicios.routes'));
router.use(require('./historial.routes'));
router.use(require('./productos.routes'));
router.use(require('./categorias.routes'));
router.use(require('./preguntas.routes'));
router.use(require('./chats.routes'));
router.use(require('./comentarios.routes'));
router.use(require('./mensajes.routes'));
router.use(require('./notificaciones.routes'));
router.use(require('./tipodocumento.routes'));

module.exports = router;
