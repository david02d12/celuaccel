const router = require('express').Router();
const categoriaController = require('../controllers/categoriaController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

router.get('/categorias/listar',          validarToken,              categoriaController.listar);
router.post('/categorias/agregar',        validarToken, validarRol(1, 3), categoriaController.agregar);
router.put('/categorias/actualizar',      validarToken, validarRol(1, 3), categoriaController.actualizar);
router.delete('/categorias/eliminar/:id', validarToken, validarRol(1, 3), categoriaController.eliminar);

module.exports = router;
