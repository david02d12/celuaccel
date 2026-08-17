/**
 * middlewares/authMiddleware.js
 * Middlewares de autenticación y autorización por roles para CeluAccel.
 *
 * Exporta dos middlewares que se usan en las rutas protegidas:
 *
 *   validarToken  — verifica que el request tenga un JWT válido en el header
 *                   Authorization: Bearer <token>
 *                   Si el token es válido, agrega req.userId con el ID del usuario.
 *                   Responde 401 si no hay token, 403 si el token es inválido.
 *
 *   validarRol    — verifica que el usuario autenticado tenga uno de los roles
 *                   permitidos consultando la base de datos.
 *                   Se usa después de validarToken.
 *                   Roles disponibles: 1 (Técnico), 2 (Usuario), 3 (Administrador)
 *
 * Uso en una ruta:
 *   router.get('/ruta', validarToken, validarRol(1, 3), controller.metodo);
 */
const jwt = require('jsonwebtoken');
const { queryPromise } = require('../config/db');
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) throw new Error('JWT_SECRET no está definido en las variables de entorno.');

/**
 * Valida que el request tenga un token JWT válido.
 * Agrega req.userId si el token es correcto.
 */
const validarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
        req.userId = decoded.id;
        next();
    });
};

/**
 * Verifica que el usuario tenga uno de los roles permitidos.
 * @param {...number} rolesPermitidos - IDs de rol permitidos (ej: 1, 3)
 */
const validarRol = (...rolesPermitidos) => {
    return async (req, res, next) => {
        if (!req.userId) return res.status(401).json({ error: 'Usuario no autenticado.' });
        try {
            const results = await queryPromise(
                'SELECT Codigo_Rol FROM Usuario WHERE ID_Usuario = ?',
                [req.userId]
            );
            if (results.length === 0) {
                return res.status(403).json({ error: 'Usuario no encontrado.' });
            }
            const rol = results[0].Codigo_Rol;
            if (!rolesPermitidos.includes(rol)) {
                return res.status(403).json({
                    error: `Acceso denegado. Se requiere uno de los roles: ${rolesPermitidos.join(', ')}. Tu rol actual: ${rol}.`
                });
            }
            req.userRol = rol;
            next();
        } catch (err) {
            console.error('Error en validarRol:', err.message);
            res.status(500).json({ error: 'Error al verificar el rol del usuario.' });
        }
    };
};

module.exports = { validarToken, validarRol };