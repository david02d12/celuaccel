const AppError = require('../config/AppError');
const servicioDao = require('../dao/servicio.dao');
const usuarioDao = require('../dao/usuario.dao');

const listar = () => servicioDao.getAll();

const misServicios = async (idUsuario, userId) => {
    if (!idUsuario) throw new AppError('El ID de usuario es obligatorio.', 400);
    const rolRes = await usuarioDao.getRol(userId);
    const miRol = rolRes.length > 0 ? rolRes[0].Codigo_Rol : 2;
    if (idUsuario !== userId && miRol !== 1 && miRol !== 3) {
        throw new AppError('Acceso denegado: solo puedes ver tus propios servicios.', 403);
    }
    return servicioDao.getByUsuario(idUsuario);
};

const agregar = async (data, userId) => {
    const { Descripcion, ID_Usuario } = data;
    if (!Descripcion || !ID_Usuario) {
        throw new AppError('Los campos Descripcion e ID_Usuario son obligatorios.', 400);
    }
    const rolRes = await usuarioDao.getRol(userId);
    const miRol = rolRes.length > 0 ? rolRes[0].Codigo_Rol : 2;
    if (ID_Usuario !== userId && miRol !== 1 && miRol !== 3) {
        throw new AppError('Acceso denegado: no puedes crear servicios para otro usuario.', 403);
    }
    return servicioDao.create(data);
};

const actualizar = async (data) => {
    if (!data.ID_Servicio) throw new AppError('El campo ID_Servicio es obligatorio para actualizar.', 400);
    const result = await servicioDao.update(data);
    if (result.affectedRows === 0) throw new AppError('Servicio no encontrado.', 404);
};

const cancelar = async (id, userId) => {
    if (!id) throw new AppError('El ID del servicio es obligatorio.', 400);
    const rows = await servicioDao.findById(id);
    if (rows.length === 0) throw new AppError('Servicio no encontrado.', 404);

    const { Etapa, ID_Usuario } = rows[0];
    if (Number(Etapa) === 100) throw new AppError('No se puede cancelar un servicio ya completado.', 409);
    if (Number(Etapa) === -1)  throw new AppError('El servicio ya fue cancelado.', 409);

    const rolRes = await usuarioDao.getRol(userId);
    const rolUsuario = rolRes[0]?.Codigo_Rol;
    if (userId !== ID_Usuario && rolUsuario !== 1 && rolUsuario !== 3) {
        throw new AppError('No tienes permiso para cancelar este servicio.', 403);
    }
    const result = await servicioDao.cancelar(id);
    if (result.affectedRows === 0) throw new AppError('Servicio no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del servicio es obligatorio.', 400);
    const result = await servicioDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Servicio no encontrado.', 404);
};

module.exports = { listar, misServicios, agregar, actualizar, cancelar, eliminar };
