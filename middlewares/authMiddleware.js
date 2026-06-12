const jwt = require('jsonwebtoken');
const { queryPromise } = require('../config/db');
const SECRET_KEY = process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure';
// 401 → Sin token | 403 → Token inválido o rol insuficiente

// Valida que el request tenga un token JWT válido
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

// C3 FIX: validarRol ahora usa async/await con queryPromise en lugar de callback
// Evita requests colgados por timeout de callback y es consistente con el resto de la app
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

// B2 FIX: SECRET_KEY ya no se exporta (era innecesario y un riesgo de seguridad)
module.exports = { validarToken, validarRol };