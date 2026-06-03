const router = require('express').Router();
const authController = require('../controllers/authController');
const { validarToken } = require('../middlewares/authMiddleware');

// Públicas
router.post('/registro', authController.registro);
router.post('/login',    authController.login);

// Perfil (autenticado)
router.get('/usuarios/perfil/:id', validarToken, authController.perfilPublico);
router.put('/usuarios/mi-perfil',  validarToken, authController.actualizarMiPerfil);

module.exports = router;
