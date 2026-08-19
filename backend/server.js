/**
 * server.js
 * Punto de entrada del servidor backend de CeluAccel.
 *
 * Levanta una instancia de Express con:
 *   - Seguridad HTTP (Helmet, CORS, rate limiting, límite de body)
 *   - Rutas REST bajo /api
 *   - Servidor de archivos estáticos en /uploads
 *   - Documentación Swagger en /doc
 *   - Socket.IO para el módulo de chat en tiempo real
 *   - Manejo global de errores y excepciones no capturadas
 *
 * Puerto: variable de entorno PORT (por defecto 3000)
 */
require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUI = require('swagger-ui-express');
const swaggerDocumentation = require('./swagger.json');
const cors = require('cors');
const { registrarEventos } = require('./config/socket.handler');

const app = express();

// Protección de headers HTTP
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS restringido al origen del frontend
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:3000/doc',
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origen no permitido: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Límite de tamaño de body
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limiting en rutas públicas (protección contra fuerza bruta)
const limiterPublico = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Por favor espera 15 minutos e intenta de nuevo.' }
});
app.use('/api/login', limiterPublico);
app.use('/api/registro', limiterPublico);
app.use('/api/forgot-password', limiterPublico);
app.use('/api/reset-password', limiterPublico);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Archivos subidos (adjuntos de chat)
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Documentación Swagger
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

// Promesas rechazadas no manejadas
process.on('unhandledRejection', (reason) => {
    console.error('Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Excepcion no capturada:', err.message);
});

// Servidor HTTP + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

registrarEventos(io);
app.set('io', io);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        console.log(`Documentacion: http://localhost:${PORT}/doc`);
        console.log(`Socket.IO activo en ws://localhost:${PORT}`);
    });
}

module.exports = { app, server };
