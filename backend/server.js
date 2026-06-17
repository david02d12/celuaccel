require('dotenv').config();
const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerDocumentation = require('./swagger.json');
const cors = require('cors');

const app = express();

// M3 FIX: CORS restringido al origen del frontend (no más '*')
// Configurar FRONTEND_URL en el .env para producción
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',  // puerto alternativo de Vite
    'http://127.0.0.1:5173',
];
app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origen (Postman, mobile apps, mismo servidor)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origen no permitido: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// B6 FIX: Limite de tamaño de body para prevenir payloads gigantes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
// TODO B7: Añadir rate limiting en rutas públicas (/login, /registro, /forgot-password)
// npm install express-rate-limit
// const rateLimit = require('express-rate-limit');
// app.use('/api/login', rateLimit({ windowMs: 15*60*1000, max: 10 }));

// Documentacion Swagger
app.use('/doc', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation));

// Rutas API
const routes = require('./routes/index');
app.use('/api', routes);

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err.message || err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Error interno del servidor.' });
});

// Capturar promesas rechazadas no manejadas
process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Excepcion no capturada:', err.message);
});

// Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentacion: http://localhost:${PORT}/doc`);
});
