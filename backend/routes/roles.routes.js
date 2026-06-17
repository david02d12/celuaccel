const router = require('express').Router();
const rolesController = require('../controllers/rolesController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

// listar: accesible para todos los autenticados (necesario en formulario de registro)
router.get('/roles/listar',          validarToken,              rolesController.listarRoles);
router.post('/roles/agregar',        validarToken, validarRol(3), rolesController.agregarRol);
router.put('/roles/actualizar',      validarToken, validarRol(3), rolesController.actualizarRol);
router.delete('/roles/eliminar/:id', validarToken, validarRol(3), rolesController.eliminarRol);

module.exports = router;
