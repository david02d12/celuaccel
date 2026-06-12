const router = require('express').Router();
const authController = require('../controllers/authController');
const { validarToken } = require('../middlewares/authMiddleware');

// Públicas
router.post('/registro', authController.registro);
router.post('/login',    authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Perfil (autenticado)
router.get('/usuarios/perfil/:id', validarToken, authController.perfilPublico);
router.put('/usuarios/mi-perfil',  validarToken, authController.actualizarMiPerfil);
router.post('/change-password',     validarToken, authController.changePassword);


module.exports = router;
