const router = require('express').Router();
const authController = require('../controllers/authController');
const { validarToken } = require('../middlewares/authMiddleware');
const { forgotPassword, resetPassword } = require('../controllers/authController');


// Públicas
router.post('/registro', authController.registro);
router.post('/login',    authController.login);

// Perfil (autenticado)
router.get('/usuarios/perfil/:id', validarToken, authController.perfilPublico);
router.put('/usuarios/mi-perfil',  validarToken, authController.actualizarMiPerfil);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
