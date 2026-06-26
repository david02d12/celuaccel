const AppError = require('../config/AppError');
const comentarioDao = require('../dao/comentario.dao');
const usuarioDao = require('../dao/usuario.dao');

const listar = () => comentarioDao.getAll();

const agregar = async ({ ID_Usuario, Comentario, Fecha_Comentario, Estrellas }, userId) => {
    if (!ID_Usuario || !Comentario) {
        throw new AppError('Los campos ID_Usuario y Comentario son obligatorios.', 400);
    }
    const rolRes = await usuarioDao.getRol(userId);
    const miRol = rolRes.length > 0 ? Number(rolRes[0].Codigo_Rol) : 2;
    if (String(ID_Usuario).trim() !== String(userId).trim() && miRol === 2) {
        throw new AppError('Acceso denegado: no puedes publicar comentarios en nombre de otro usuario.', 403);
    }
    const fecha = Fecha_Comentario || new Date().toISOString().split('T')[0];
    const estrellas = (Estrellas >= 1 && Estrellas <= 5) ? Number(Estrellas) : 5;
    const result = await comentarioDao.create({ ID_Usuario, Comentario, Fecha_Comentario: fecha, Estrellas: estrellas });
    return { message: 'Comentario publicado correctamente.', id: result.insertId };
};

const _verificarPropiedad = async (codigoComentario, userId) => {
    const rows = await comentarioDao.findById(codigoComentario);
    if (rows.length === 0) throw new AppError('Comentario no encontrado.', 404);
    const ownerId = rows[0].ID_Usuario;
    const rolRes = await usuarioDao.getRol(userId);
    if (rolRes.length === 0) throw new AppError('Usuario no encontrado.', 404);
    const rol = rolRes[0].Codigo_Rol;
    if (userId !== ownerId && rol !== 1 && rol !== 3) {
        throw new AppError('No puedes modificar comentarios de otros usuarios.', 403);
    }
};

const actualizar = async ({ Comentario, Fecha_Comentario, Estrellas, Codigo_Comentario }, userId) => {
    if (!Codigo_Comentario) throw new AppError('El campo Codigo_Comentario es obligatorio.', 400);
    await _verificarPropiedad(Codigo_Comentario, userId);
    const fecha = Fecha_Comentario || new Date().toISOString().split('T')[0];
    const estrellas = (Estrellas >= 1 && Estrellas <= 5) ? Number(Estrellas) : 5;
    await comentarioDao.update({ Comentario, Fecha_Comentario: fecha, Estrellas: estrellas, Codigo_Comentario });
};

const eliminar = async (id, userId) => {
    if (!id) throw new AppError('El ID del comentario es obligatorio.', 400);
    await _verificarPropiedad(id, userId);
    await comentarioDao.remove(id);
};

module.exports = { listar, agregar, actualizar, eliminar };
