const router = require('express').Router();
const tipoController = require('../controllers/tipoController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

router.get('/tipodocumento/listar',          validarToken,              tipoController.listarDocumentos);
router.post('/tipodocumento/agregar',        validarToken, validarRol(3), tipoController.agregarDocumento);
router.put('/tipodocumento/actualizar',      validarToken, validarRol(3), tipoController.actualizarDocumento);
router.delete('/tipodocumento/eliminar/:id', validarToken, validarRol(3), tipoController.eliminarDocumento);

module.exports = router;
