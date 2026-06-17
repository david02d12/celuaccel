const router = require('express').Router();
const authController = require('../controllers/authController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

// Solo Administrador (rol 3)
router.get('/usuarios/listar',            validarToken, validarRol(3), authController.listar);
router.put('/usuarios/actualizar',        validarToken, validarRol(3), authController.actualizar);
router.put('/usuarios/actualizar/:id',    validarToken, validarRol(3), authController.actualizar);
router.delete('/usuarios/eliminar/:id',   validarToken, validarRol(3), authController.eliminar);

module.exports = router;
