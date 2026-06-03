const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endPointsFiles = ['./routes/Routes.js'];

const doc = {
    info: {
        title: 'API Celuaccel — Sistema de Reparaciones Móviles',
        description: 'Documentación completa de la API REST del sistema Celuaccel. Incluye autenticación JWT, gestión de usuarios, servicios, chat, catálogo y más. Accede con Bearer token en el header Authorization.'
    },
    host: 'localhost:3000',
    basePath: '/api',
    schemes: ['http'],
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
