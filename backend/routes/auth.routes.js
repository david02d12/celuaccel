/**
 * routes/auth.routes.js
 * Rutas de autenticación y gestión de perfil de CeluAccel.
 *
 * Rutas públicas (sin token):
 *   POST /api/registro              → registra un nuevo usuario
 *   POST /api/login                 → inicia sesión, retorna token JWT
 *   POST /api/forgot-password       → envía correo de recuperación
 *   POST /api/reset-password/:token → restablece la contraseña
 *
 * Rutas protegidas (requieren token):
 *   GET  /api/usuarios/perfil/:id   → perfil público de cualquier usuario
 *   PUT  /api/usuarios/mi-perfil    → edita el perfil del usuario autenticado
 *   POST /api/change-password       → cambia la contraseña (requiere la actual)
 */
const router = require('express').Router();
const authController = require('../controllers/authController');
const { validarToken } = require('../middlewares/authMiddleware');

router.post('/registro', authController.registro);
router.post('/login',    authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

router.get('/usuarios/perfil/:id', validarToken, authController.perfilPublico);
router.put('/usuarios/mi-perfil',  validarToken, authController.actualizarMiPerfil);
router.post('/change-password',     validarToken, authController.changePassword);

module.exports = router;
