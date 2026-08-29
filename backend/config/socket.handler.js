/**
 * config/socket.handler.js
 * Gestión de eventos de Socket.IO para el chat en tiempo real de CeluAccel.
 *
 * Cada conexión pasa por un middleware de autenticación JWT antes de
 * poder unirse a salas o enviar mensajes.
 *
 * Eventos que escucha el servidor:
 *   - unirse_chat    : el cliente se une a la sala del chat (chat_{id})
 *   - salir_chat     : el cliente abandona la sala
 *   - enviar_mensaje : el cliente envía un mensaje de texto al chat
 *   - escribiendo    : indica que el usuario está escribiendo (typing indicator)
 *   - mensajes_leidos: notifica que los mensajes fueron leídos
 *
 * Eventos que emite el servidor:
 *   - nuevo_mensaje      : distribuye el mensaje a todos en la sala
 *   - usuario_escribiendo: notifica a los otros participantes del typing indicator
 *   - mensajes_vistos    : notifica la confirmación de lectura
 *
 * Uso: importado en server.js y llamado con registrarEventos(io)
 */

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) throw new Error('JWT_SECRET no está definido en las variables de entorno.');

/**
 * Middleware de autenticación para Socket.IO.
 * Verifica el token JWT del handshake antes de permitir la conexión.
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

    io.use(autenticarSocket);

    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`[Socket] Usuario conectado: ${userId} (socket: ${socket.id})`);

        socket.on('unirse_chat', (codigoChat) => {
            const sala = `chat_${codigoChat}`;
            socket.join(sala);
            console.log(`[Socket] ${userId} se unió a la sala ${sala}`);
        });

        socket.on('salir_chat', (codigoChat) => {
            const sala = `chat_${codigoChat}`;
            socket.leave(sala);
            console.log(`[Socket] ${userId} abandonó la sala ${sala}`);
        });

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

            io.to(sala).emit('nuevo_mensaje', payload);
            console.log(`[Socket] Mensaje en sala ${sala} de ${userId}`);
        });

        socket.on('escribiendo', ({ Codigo_Chat, escribiendo }) => {
            const sala = `chat_${Codigo_Chat}`;
            socket.to(sala).emit('usuario_escribiendo', {
                ID_Usuario: userId,
                escribiendo: !!escribiendo,
            });
        });

        socket.on('mensajes_leidos', ({ Codigo_Chat }) => {
            const sala = `chat_${Codigo_Chat}`;
            socket.to(sala).emit('mensajes_vistos', {
                ID_Usuario: userId,
                Codigo_Chat,
            });
        });

        socket.on('disconnect', (razon) => {
            console.log(`[Socket] Usuario desconectado: ${userId} — Razón: ${razon}`);
        });

        socket.on('error', (err) => {
            console.error(`[Socket] Error en socket ${socket.id}:`, err.message);
        });
    });
};

module.exports = { registrarEventos };
