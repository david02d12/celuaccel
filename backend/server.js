require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const swaggerUI  = require('swagger-ui-express');
const swaggerDocumentation = require('./swagger.json');
const cors = require('cors');

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
app.use('/api/login',           limiterPublico);
app.use('/api/registro',        limiterPublico);
app.use('/api/forgot-password', limiterPublico);
app.use('/api/reset-password',  limiterPublico);

// Health check para monitoreo de disponibilidad
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
