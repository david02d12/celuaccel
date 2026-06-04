const router = require('express').Router();
const chatController = require('../controllers/chatController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

router.get('/chats/listar-mios',    validarToken,              chatController.listarMios);
router.get('/chats/listar',         validarToken, validarRol(1, 3), chatController.listar);
router.post('/chats/agregar',       validarToken,              chatController.agregar);
router.post('/chats/crear',         validarToken,              chatController.agregar);
router.put('/chats/actualizar',     validarToken,              chatController.actualizar);
router.delete('/chats/eliminar/:id',validarToken, validarRol(1, 3), chatController.eliminar);

module.exports = router;
