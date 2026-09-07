const nodemailer = require('nodemailer');
const AppError = require('../config/AppError');

// Valores de ejemplo que NO son credenciales reales
const PLACEHOLDER_USER = 'tu_correo_de_gmail@gmail.com';
const PLACEHOLDER_PASS = 'tu_contrasena_de_aplicacion';

module.exports = async (to, subject, text) => {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SENDING] Destinatario: ${to}`);
    console.log(`[EMAIL SENDING] Asunto: ${subject}`);
    console.log(`[EMAIL SENDING] Contenido:\n${text}`);
    console.log(`==================================================\n`);

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Sin configuración de correo → silencio en desarrollo (ver consola)
    if (!emailUser || !emailPass) {
        console.warn('Advertencia: EMAIL_USER o EMAIL_PASS no están configurados.');
        console.warn('El correo real no se enviará. Copia el enlace de la consola.');
        return;
    }

    // Credenciales de ejemplo → lanzar error legible al usuario
    if (emailUser === PLACEHOLDER_USER || emailPass === PLACEHOLDER_PASS) {
        throw new AppError(
            'El servicio de correo no está configurado correctamente en el servidor. ' +
            'Contacta al administrador del sistema.',
            503
        );
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        await transporter.sendMail({
            from: emailUser,
            to,
            subject,
            text
        });
        console.log(`[EMAIL SENT] Correo enviado exitosamente a ${to}`);
    } catch (error) {
        console.error('Error al enviar el correo con nodemailer:', error.message);
        throw new AppError(
            'No se pudo enviar el correo de recuperación. Verifica las credenciales de correo en el servidor.',
            503
        );
    }
};

