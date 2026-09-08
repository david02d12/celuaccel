const axios = require('axios');

module.exports = async (to, subject, text) => {
    console.log(`[EMAIL SETUP] Preparando envío hacia: ${to}`);

    // 1. Validar variables de entorno (Brevo)
    if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
        console.error('[EMAIL ERROR] BREVO_API_KEY o EMAIL_USER no están configurados en Render.');
        throw new Error('El servicio de correo no está configurado en el servidor.');
    }

    try {
        // 2. Consumir la API REST de Brevo (evita usar puertos SMTP como el 465 o 25)
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: 'CeluAccel Soporte', email: process.env.EMAIL_USER },
                to: [{ email: to }],
                subject: subject,
                textContent: text
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );

        console.log(`[EMAIL SENT] Correo enviado exitosamente a ${to}. Message ID: ${response.data?.messageId}`);
    } catch (error) {
        console.error('[EMAIL ERROR] Error en la API de Brevo:', error.response?.data || error.message);
        throw new Error(`No se pudo enviar el correo de recuperación. Inténtalo más tarde.`);
    }
};
