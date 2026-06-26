const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endPointsFiles = ['./routes/index.js'];

const doc = {
    info: {
        title: 'API Celuaccel — Sistema de Reparaciones Móviles',
        description: 'Documentación completa de la API REST del sistema Celuaccel. Incluye autenticación JWT, gestión de usuarios, servicios, chat, catálogo y más. Accede con Bearer token en el header Authorization.'
    },
    host: 'localhost:3000',
    basePath: '/api',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        { name: 'Auth',           description: 'Registro, login y gestión de contraseñas' },
        { name: 'Usuarios',       description: 'Administración de usuarios' },
        { name: 'Roles',          description: 'Administración de roles' },
        { name: 'Servicios',      description: 'Órdenes de servicio / reparaciones' },
        { name: 'Historial',      description: 'Historial de acciones sobre servicios' },
        { name: 'Productos',      description: 'Catálogo de productos / repuestos' },
        { name: 'Categorías',     description: 'Categorías de productos' },
        { name: 'Preguntas',      description: 'Preguntas frecuentes de clientes' },
        { name: 'Chats',          description: 'Canales de chat entre usuario y técnico' },
        { name: 'Mensajes',       description: 'Mensajes dentro de un chat' },
        { name: 'Comentarios',    description: 'Comentarios / valoraciones de servicios' },
        { name: 'Notificaciones', description: 'Notificaciones push / internas' },
        { name: 'TipoDocumento',  description: 'Tipos de documento de identidad' },
    ],
    securityDefinitions: {
        BearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Ingresa: Bearer <tu_token_jwt>'
        }
    }
};

swaggerAutogen(outputFile, endPointsFiles, doc);
