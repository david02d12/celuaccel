/**
 * socket.handler.js
 * EP-005: Comunicación en tiempo real con Socket.IO
 * Maneja eventos de chat entre clientes, técnicos y administradores.
 */

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure';

/**
 * Middleware de autenticación para Socket.IO.
 * Verifica el token JWT en el handshake antes de permitir la conexión.
 */
const autenticarSocket = (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
        return next(new Error('Token no proporcionado. Conexión rechazada.'));
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error('Token inválido o expirado.'));
    }
};

/**
 * Registra todos los eventos de Socket.IO en el servidor.
 * @param {import('socket.io').Server} io
 */
const registrarEventos = (io) => {

    // Middleware de autenticación para todas las conexiones
    io.use(autenticarSocket);

    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`[Socket] Usuario conectado: ${userId} (socket: ${socket.id})`);

        // ── Unirse a una sala de chat ─────────────────────────────────────
        // El cliente envía el Codigo_Chat al conectarse al módulo de mensajería
        socket.on('unirse_chat', (codigoChat) => {
            const sala = `chat_${codigoChat}`;
            socket.join(sala);
            console.log(`[Socket] ${userId} se unió a la sala ${sala}`);
        });

        // ── Abandonar una sala de chat ────────────────────────────────────
        socket.on('salir_chat', (codigoChat) => {
            const sala = `chat_${codigoChat}`;
            socket.leave(sala);
            console.log(`[Socket] ${userId} abandonó la sala ${sala}`);
        });

        // ── Enviar mensaje en tiempo real ─────────────────────────────────
        // El cliente envía: { Codigo_Chat, Mensaje, Fecha_Mensaje? }
        // El servidor emite el mensaje a todos en la sala del chat
        socket.on('enviar_mensaje', (data) => {
            const { Codigo_Chat, Mensaje } = data;
            if (!Codigo_Chat || !Mensaje) return;

            const sala = `chat_${Codigo_Chat}`;
            const payload = {
                Codigo_Chat,
                ID_Usuario: userId,
                Mensaje,
                Fecha_Mensaje: data.Fecha_Mensaje || new Date().toISOString().slice(0, 19).replace('T', ' '),
                Estado: 0,
            };

            // Emitir a todos los participantes de la sala (incluyendo el emisor)
            io.to(sala).emit('nuevo_mensaje', payload);
            console.log(`[Socket] Mensaje en sala ${sala} de ${userId}`);
        });

        // ── Indicador de escritura ────────────────────────────────────────
        socket.on('escribiendo', ({ Codigo_Chat, escribiendo }) => {
            const sala = `chat_${Codigo_Chat}`;
            // Emite a todos EXCEPTO al que está escribiendo
            socket.to(sala).emit('usuario_escribiendo', {
                ID_Usuario: userId,
                escribiendo: !!escribiendo,
            });
        });

        // ── Marcar mensajes como leídos ───────────────────────────────────
        socket.on('mensajes_leidos', ({ Codigo_Chat }) => {
            const sala = `chat_${Codigo_Chat}`;
            socket.to(sala).emit('mensajes_vistos', {
                ID_Usuario: userId,
                Codigo_Chat,
            });
        });

        // ── Desconexión ───────────────────────────────────────────────────
        socket.on('disconnect', (razon) => {
            console.log(`[Socket] Usuario desconectado: ${userId} — Razón: ${razon}`);
        });

        // ── Error de socket ───────────────────────────────────────────────
        socket.on('error', (err) => {
            console.error(`[Socket] Error en socket ${socket.id}:`, err.message);
        });
    });
};

module.exports = { registrarEventos };
