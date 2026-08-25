const router = require('express').Router();
const authController = require('../controllers/authController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

// Administrador (3) y Técnico (1) pueden ver la lista de usuarios
router.get('/usuarios/listar',            validarToken, validarRol(1, 3), authController.listar);
router.put('/usuarios/actualizar',        validarToken, validarRol(3), authController.actualizar);
router.put('/usuarios/actualizar/:id',    validarToken, validarRol(3), authController.actualizar);
router.delete('/usuarios/eliminar/:id',   validarToken, validarRol(3), authController.eliminar);

module.exports = router;
