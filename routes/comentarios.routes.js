const router = require('express').Router();
const comentarioController = require('../controllers/comentarioController');
const { validarToken } = require('../middlewares/authMiddleware');

router.get('/comentarios/listar',          validarToken, comentarioController.listar);
router.post('/comentarios/agregar',        validarToken, comentarioController.agregar);
router.put('/comentarios/actualizar',      validarToken, comentarioController.actualizar);
router.delete('/comentarios/eliminar/:id', validarToken, comentarioController.eliminar);

module.exports = router;
