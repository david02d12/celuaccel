const jwt = require('jsonwebtoken');
const db = require('../config/db');
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

// Verifica que el usuario tenga uno de los roles permitidos
// Uso: validarRol(1, 3)  → solo técnicos y admins
// Uso: validarRol(3)     → solo administradores
const validarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.userId) return res.status(401).json({ error: 'Usuario no autenticado.' });

        db.query('SELECT Codigo_Rol FROM Usuario WHERE ID_Usuario = ?', [req.userId], (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al verificar el rol del usuario.' });
            if (results.length === 0) return res.status(403).json({ error: 'Usuario no encontrado.' });

            const rol = results[0].Codigo_Rol;
            if (!rolesPermitidos.includes(rol)) {
                return res.status(403).json({
                    error: `Acceso denegado. Se requiere uno de los roles: ${rolesPermitidos.join(', ')}. Tu rol actual: ${rol}.`
                });
            }
            req.userRol = rol;
            next();
        });
    };
};

module.exports = { validarToken, validarRol, SECRET_KEY };