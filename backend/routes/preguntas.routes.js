const router = require('express').Router();
const preguntaController = require('../controllers/preguntaController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

// Clientes → solo sus preguntas | Técnico/Admin → todas
router.get('/preguntas/mis-preguntas',      validarToken,                  preguntaController.listarMias);
router.get('/preguntas/listar',             validarToken, validarRol(1, 3), preguntaController.listar);
router.post('/preguntas/agregar',           validarToken,                  preguntaController.agregar);
router.put('/preguntas/actualizar',         validarToken,                  preguntaController.actualizar);
/** Técnico responde una pregunta del catálogo */
router.put('/preguntas/responder/:id',      validarToken, validarRol(1, 3), preguntaController.responder);
router.delete('/preguntas/eliminar/:id',    validarToken, validarRol(1, 3), preguntaController.eliminar);

module.exports = router;
