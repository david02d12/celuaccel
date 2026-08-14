const bcrypt = require('bcrypt');
const AppError = require('../config/AppError');
const usuarioDao = require('../dao/usuario.dao');

const SALT_ROUNDS = 10;

const validarCambioRol = async (ID_Usuario, Codigo_Rol) => {
    if (Codigo_Rol === undefined) return;
    const rolRes = await usuarioDao.getRol(ID_Usuario);
    if (rolRes.length === 0) return;
    const rolActual = Number(rolRes[0].Codigo_Rol);
    if (rolActual === 3 && Number(Codigo_Rol) !== 3) {
        const adminsCount = await usuarioDao.countAdmins();
        if (adminsCount < 2) {
            throw new AppError(
                'No puedes quitar el rol de administrador porque debe haber al menos un administrador en el sistema.',
                403
            );
        }
    }
};

const procesarClave = async (Clave) => {
    if (!Clave) return null;
    if (Clave.trim().length < 6) throw new AppError('La contraseña debe tener al menos 6 caracteres.', 400);
    if (Clave.trim().length > 15) throw new AppError('La contraseña no puede exceder los 15 caracteres.', 400);
    return await bcrypt.hash(Clave, SALT_ROUNDS);
};

const validarEliminacionAdmin = async (id) => {
    const rolRes = await usuarioDao.getRol(id);
    if (rolRes.length > 0 && Number(rolRes[0].Codigo_Rol) === 3) {
        const adminsCount = await usuarioDao.countAdmins();
        if (adminsCount < 2) {
            throw new AppError('No puedes eliminar a este usuario porque es el único administrador en el sistema.', 403);
        }
    }
};

const listar = () => usuarioDao.getAll();

const actualizar = async ({ Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Clave, Codigo_Rol, ID_Usuario }, userId) => {
    if (!ID_Usuario) throw new AppError('El campo ID_Usuario es obligatorio para actualizar.', 400);

    await validarCambioRol(ID_Usuario, Codigo_Rol);
    const hashedClave = await procesarClave(Clave);

    const result = await usuarioDao.update({ Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, hashedClave, Codigo_Rol, ID_Usuario });
    if (result.affectedRows === 0) throw new AppError('Usuario no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del usuario es obligatorio.', 400);
    
    await validarEliminacionAdmin(id);

    const result = await usuarioDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Usuario no encontrado.', 404);
};

const perfilPublico = async (id, userId) => {
    if (!id) throw new AppError('El ID del usuario es obligatorio.', 400);
    // Verificar permisos: solo el propio usuario, técnicos (1) o admin (3)
    const rolRes = await usuarioDao.getRol(userId);
    if (rolRes.length === 0) throw new AppError('No autorizado.', 403);
    const rol = rolRes[0].Codigo_Rol;
    if (String(userId) !== String(id) && rol !== 1 && rol !== 3) {
        throw new AppError('No tienes permiso para ver este perfil.', 403);
    }
    const results = await usuarioDao.findById(id);
    if (results.length === 0) throw new AppError('Usuario no encontrado.', 404);
    return results[0];
};

const actualizarMiPerfil = async (idSolicitante, { Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Clave }) => {
    if (!Nombre || !Correo) throw new AppError('Nombre y correo son obligatorios.', 400);
    
    const hashedClave = await procesarClave(Clave);

    const result = await usuarioDao.updateMiPerfil({ Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, hashedClave, ID_Usuario: idSolicitante });
    if (result.affectedRows === 0) throw new AppError('Usuario no encontrado.', 404);
};

module.exports = { listar, actualizar, eliminar, perfilPublico, actualizarMiPerfil };
