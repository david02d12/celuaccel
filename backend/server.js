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

// Seguridad HTTP — Headers de protección (XSS, clickjacking, MIME sniffing)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS restringido al origen del frontend
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',  // puerto alternativo de Vite
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:3000/doc',
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

// Limite de tamaño de body para prevenir payloads gigantes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limiting en rutas públicas para prevenir fuerza bruta y spam
const limiterPublico = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    max: 20,                   // máximo 20 intentos por ventana por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Por favor espera 15 minutos e intenta de nuevo.' }
});
app.use('/api/login', limiterPublico);
app.use('/api/registro', limiterPublico);
app.use('/api/forgot-password', limiterPublico);
app.use('/api/reset-password', limiterPublico);

// Health check para monitoreo de disponibilidad
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// EP-005: Servir archivos subidos (adjuntos de chat) como estáticos
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

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

// ─── Servidor HTTP + Socket.IO ──────────────────────────────────────────────
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

// Registrar eventos del chat en tiempo real (EP-005)
registrarEventos(io);

// Exponer io globalmente para que otros módulos puedan emitir eventos
app.set('io', io);

// Arrancar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentacion: http://localhost:${PORT}/doc`);
    console.log(`Socket.IO activo en ws://localhost:${PORT}`);
});
