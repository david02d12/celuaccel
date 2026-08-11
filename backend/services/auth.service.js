const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../config/AppError');
const usuarioDao = require('../dao/usuario.dao');

const SECRET_KEY = process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure';
const SALT_ROUNDS = 10;

const registro = async ({ ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Clave, Codigo_Rol }) => {
    if (!ID_Usuario || !Nombre || !Correo || !Clave) {
        throw new AppError('Los campos ID_Usuario, Nombre, Correo y Clave son obligatorios.', 400);
    }
    if (Clave) {
        if (Clave.trim().length < 6) throw new AppError('La contraseña debe tener al menos 6 caracteres.', 400);
        if (Clave.trim().length > 15) throw new AppError('La contraseña no puede exceder los 15 caracteres.', 400);
    }
    const hashedClave = await bcrypt.hash(Clave, SALT_ROUNDS);
    const rolAsignado = Codigo_Rol || 2;
    try {
        await usuarioDao.create({ ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, hashedClave, rolAsignado });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('El usuario ya existe en el sistema.', 409);
        throw err;
    }
};

const login = async (user, password) => {
    if (!user || !password) {
        throw new AppError('Usuario y contraseña son obligatorios.', 400);
    }
    const results = await usuarioDao.findByUsername(user.trim());
    if (results.length === 0) throw new AppError('Credenciales incorrectas.', 401);

    const match = await bcrypt.compare(password.trim(), results[0].Contraseña);
    if (!match) throw new AppError('Credenciales incorrectas.', 401);

    const token = jwt.sign({ id: results[0].ID_Usuario }, SECRET_KEY, { expiresIn: '2h' });
    return { auth: true, token, user: results[0].ID_Usuario, nombre: results[0].Nombre, role: results[0].Codigo_Rol };
};

const changePassword = async (userId, oldPassword, newPassword) => {
    if (!userId || !oldPassword || !newPassword) {
        throw new AppError('Todos los campos son obligatorios.', 400);
    }

    const users = await usuarioDao.findByUsername(userId);
    if (users.length === 0) throw new AppError('Usuario no encontrado.', 404);

    const user = users[0];
    const match = await bcrypt.compare(oldPassword.trim(), user.Contraseña);
    if (!match) throw new AppError('La contraseña actual es incorrecta.', 400);

    if (newPassword.trim().length < 6) throw new AppError('La nueva contraseña debe tener al menos 6 caracteres.', 400);
    if (newPassword.trim().length > 15) throw new AppError('La nueva contraseña no puede exceder los 15 caracteres.', 400);
    const hashedClave = await bcrypt.hash(newPassword.trim(), SALT_ROUNDS);
    await usuarioDao.updatePassword(userId, hashedClave);
};

module.exports = { registro, login, changePassword };
