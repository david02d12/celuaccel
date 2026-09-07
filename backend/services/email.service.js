const nodemailer = require('nodemailer');

module.exports = async (to, subject, text) => {
    console.log(`[EMAIL SETUP] Preparando envío hacia: ${to}`);

    // 1. Validar que las variables existan en Render
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('[EMAIL ERROR] EMAIL_USER o EMAIL_PASS no están configurados en Render.');
        throw new Error('El servicio de correo no está configurado en el servidor.');
    }

    try {
        // 2. Transporter con Gmail (usa contraseña de aplicación de 16 caracteres)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 3. Enviar correo
        const info = await transporter.sendMail({
            from: `"CeluAccel Soporte" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });

        console.log(`[EMAIL SENT] Correo enviado exitosamente a ${to}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('[EMAIL ERROR] Error en Nodemailer:', error.message);
        throw new Error(`No se pudo enviar el correo de recuperación: ${error.message}`);
    }
};
