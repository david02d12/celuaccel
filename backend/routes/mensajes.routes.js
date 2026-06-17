const router = require('express').Router();
const mensajeController = require('../controllers/mensajeController');
const { validarToken } = require('../middlewares/authMiddleware');

router.get('/mensajes/listar',             validarToken, mensajeController.listar);
router.get('/mensajes/por-chat/:id',       validarToken, mensajeController.listarPorChat);
router.post('/mensajes/agregar',           validarToken, mensajeController.agregar);
router.put('/mensajes/actualizar',         validarToken, mensajeController.actualizar);
router.delete('/mensajes/eliminar/:id',    validarToken, mensajeController.eliminar);

module.exports = router;
