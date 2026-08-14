const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../config/AppError');
const usuarioDao = require('../dao/usuario.dao');
const sendEmail = require('./email.service');

const SECRET_KEY = process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure';
const SALT_ROUNDS = 10;

const forgotPassword = async (email) => {
    if (!email) throw new AppError('El correo electrónico es obligatorio.', 400);
    const users = await usuarioDao.findByEmail(email.trim());
    if (users.length === 0) {
        throw new AppError('No existe ningún usuario registrado con ese correo electrónico.', 404);
    }

    const user = users[0];
    // Generar un token JWT firmado con la combinación del SECRET_KEY y el hash de la contraseña actual del usuario
    const token = jwt.sign(
        { id: user.ID_Usuario, email: user.Correo },
        SECRET_KEY + user.Contraseña,
        { expiresIn: '15m' }
    );

    // Link para el frontend web (React/Vite)
    const webUrl    = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?token=${token}`;
    // Link para la app Android (Custom Scheme — interceptado por ResetPasswordActivity)
    const androidUrl = `celuaccel://reset-password?token=${token}`;

    const text = `Hola ${user.Nombre},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en CeluAccel.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Desde la app Android:
${androidUrl}

🌐 Desde el navegador web:
${webUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Este enlace es de un solo uso y expirará en 15 minutos.

Si no solicitaste este cambio, puedes ignorar este correo de forma segura.

— Equipo CeluAccel`;

    await sendEmail(user.Correo, 'Recuperación de contraseña — CeluAccel', text);
};

const resetPassword = async (token, newPassword) => {
    if (!token || !newPassword) throw new AppError('El token y la nueva contraseña son obligatorios.', 400);

    // ✅ CORRECCIÓN DE SEGURIDAD:
    // Paso 1: Decodificar SIN verificar solo para obtener el email del payload
    //         (jwt.decode no lanza error si la firma es falsa, por eso es solo para leer el email)
    const rawDecoded = jwt.decode(token);
    if (!rawDecoded || !rawDecoded.email) {
        throw new AppError('Token con formato inválido.', 400);
    }

    // Paso 2: Buscar al usuario por email (campo más confiable que ID_Usuario)
    const users = await usuarioDao.findByEmail(rawDecoded.email);
    if (users.length === 0) throw new AppError('Usuario no encontrado.', 404);

    const user = users[0];

    // Paso 3: Verificar la firma REAL usando el hash de la contraseña actual como secreto.
    //         Esto invalida automáticamente el token si el usuario ya cambió su clave antes.
    try {
        jwt.verify(token, SECRET_KEY + user.Contraseña);
    } catch (err) {
        throw new AppError('El enlace de recuperación es inválido o ha expirado.', 400);
    }

    // Paso 4: Actualizar la contraseña
    if (newPassword.trim().length < 6) throw new AppError('La contraseña debe tener al menos 6 caracteres.', 400);
    if (newPassword.trim().length > 15) throw new AppError('La contraseña no puede exceder los 15 caracteres.', 400);
    const hashedClave = await bcrypt.hash(newPassword.trim(), SALT_ROUNDS);
    await usuarioDao.updatePassword(user.ID_Usuario, hashedClave);
};

module.exports = { forgotPassword, resetPassword };
