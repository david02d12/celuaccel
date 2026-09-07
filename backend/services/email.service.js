const AppError = require('../config/AppError');

// Valores de ejemplo que NO son credenciales reales
const PLACEHOLDER_KEY = 're_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

module.exports = async (to, subject, text) => {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SENDING] Destinatario: ${to}`);
    console.log(`[EMAIL SENDING] Asunto: ${subject}`);
    console.log(`[EMAIL SENDING] Contenido:\n${text}`);
    console.log(`==================================================\n`);

    const resendApiKey = process.env.RESEND_API_KEY;

    // Sin API key → silencio en desarrollo (ver consola)
    if (!resendApiKey) {
        console.warn('[EMAIL] RESEND_API_KEY no está configurada. El correo no se enviará (ver enlace en consola).');
        return;
    }

    // Clave de ejemplo → lanzar error legible
    if (resendApiKey === PLACEHOLDER_KEY) {
        throw new AppError(
            'El servicio de correo no está configurado correctamente en el servidor. Contacta al administrador.',
            503
        );
    }

    try {
        // Importación dinámica para compatibilidad con el módulo ESM de Resend
        const { Resend } = require('resend');
        const resend = new Resend(resendApiKey);

        const { data, error } = await resend.emails.send({
            from: 'CeluAccel <onboarding@resend.dev>',  // dominio verificado de Resend (no requiere dominio propio)
            to: [to],
            subject,
            text
        });

        if (error) {
            console.error('[EMAIL ERROR] Resend devolvió error:', JSON.stringify(error));
            throw new AppError(`Error al enviar correo: ${error.message || JSON.stringify(error)}`, 503);
        }

        console.log(`[EMAIL SENT] Correo enviado exitosamente a ${to}. ID: ${data?.id}`);
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('[EMAIL ERROR] Fallo inesperado al enviar correo:');
        console.error('  - message:', error.message);
        console.error('  - code:', error.code);
        throw new AppError(
            `No se pudo enviar el correo: ${error.message || 'Error desconocido'}`,
            503
        );
    }
};
