/**
 * config/AppError.js
 * Clase de error personalizado para el backend de CeluAccel.
 *
 * Permite lanzar errores con un código HTTP específico desde cualquier
 * capa (servicio, DAO) y capturarlos de forma uniforme en los controladores
 * mediante el helper handleError.
 *
 * Uso:
 *   throw new AppError('Usuario no encontrado.', 404);
 */
class AppError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}

module.exports = AppError;
