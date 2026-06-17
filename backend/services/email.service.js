const nodemailer = require('nodemailer');

module.exports = async (to, subject, text) => {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SENDING] Destinatario: ${to}`);
    console.log(`[EMAIL SENDING] Asunto: ${subject}`);
    console.log(`[EMAIL SENDING] Contenido:\n${text}`);
    console.log(`==================================================\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Advertencia: EMAIL_USER o EMAIL_PASS no están configurados en el archivo .env.');
        console.warn('El correo real no se enviará, pero puedes copiar el enlace de recuperación mostrado arriba.');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log(`[EMAIL SENT] Correo enviado exitosamente a ${to}`);
    } catch (error) {
        console.error('Error al enviar el correo con nodemailer:', error.message);
        // No relanzamos el error para no bloquear el flujo si las credenciales fallan en desarrollo.
    }
};
