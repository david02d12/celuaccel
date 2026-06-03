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
    return { auth: true, token, user: results[0].ID_Usuario, role: results[0].Codigo_Rol };
};

const listar = () => usuarioDao.getAll();

const actualizar = async ({ Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Clave, Codigo_Rol, ID_Usuario }) => {
    if (!ID_Usuario) throw new AppError('El campo ID_Usuario es obligatorio para actualizar.', 400);
    let hashedClave = null;
    if (Clave) hashedClave = await bcrypt.hash(Clave, SALT_ROUNDS);
    const result = await usuarioDao.update({ Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, hashedClave, Codigo_Rol, ID_Usuario });
    if (result.affectedRows === 0) throw new AppError('Usuario no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del usuario es obligatorio.', 400);
    const result = await usuarioDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Usuario no encontrado.', 404);
};

const perfilPublico = async (id, userId) => {
    if (!id) throw new AppError('El ID del usuario es obligatorio.', 400);
    // Verificar permisos: solo el propio usuario, técnicos (1) o admin (3)
    const rolRes = await usuarioDao.getRol(userId);
    if (rolRes.length === 0) throw new AppError('No autorizado.', 403);
    const rol = rolRes[0].Codigo_Rol;
    if (userId !== id && rol !== 1 && rol !== 3) {
        throw new AppError('No tienes permiso para ver este perfil.', 403);
    }
    const results = await usuarioDao.findById(id);
    if (results.length === 0) throw new AppError('Usuario no encontrado.', 404);
    return results[0];
};

const actualizarMiPerfil = async (idSolicitante, { Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Clave }) => {
    if (!Nombre || !Correo) throw new AppError('Nombre y correo son obligatorios.', 400);
    let hashedClave = null;
    if (Clave && Clave.trim()) hashedClave = await bcrypt.hash(Clave, SALT_ROUNDS);
    const result = await usuarioDao.updateMiPerfil({ Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, hashedClave, ID_Usuario: idSolicitante });
    if (result.affectedRows === 0) throw new AppError('Usuario no encontrado.', 404);
};

module.exports = { registro, login, listar, actualizar, eliminar, perfilPublico, actualizarMiPerfil };
