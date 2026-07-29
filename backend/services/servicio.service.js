const AppError = require('../config/AppError');
const servicioDao = require('../dao/servicio.dao');
const usuarioDao = require('../dao/usuario.dao');

const listar = () => servicioDao.getAll();

/** RF-014: Lista los servicios asignados al técnico autenticado */
const listarMisTecnico = async (idTecnico) => {
    if (!idTecnico) throw new AppError('Usuario no autenticado.', 401);
    return servicioDao.getByTecnico(idTecnico);
};

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

    // RN-011: No se puede cerrar una orden (Etapa=100) sin diagnóstico final registrado
    if (Number(data.Etapa) === 100) {
        const descripcion = data.Descripcion ? String(data.Descripcion).trim() : '';
        if (!descripcion) {
            throw new AppError(
                'Para completar el servicio (Etapa 100) es obligatorio registrar un diagnóstico final en el campo Descripcion (RN-011).',
                400
            );
        }
    }

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

/**
 * RF-014: Asigna un técnico a una orden de servicio.
 * Solo el administrador (rol 3) puede realizar esta acción.
 */
const asignarTecnico = async (id, idTecnico, userId) => {
    if (!id || !idTecnico) throw new AppError('ID de servicio e ID de técnico son obligatorios.', 400);

    // Verificar que la orden exista
    const rows = await servicioDao.findById(id);
    if (rows.length === 0) throw new AppError('Servicio no encontrado.', 404);
    if (Number(rows[0].Etapa) === -1) throw new AppError('No se puede asignar técnico a un servicio cancelado.', 409);

    // Verificar que el usuario a asignar sea técnico (rol 1)
    const rolTecnico = await usuarioDao.getRol(idTecnico);
    if (rolTecnico.length === 0) throw new AppError('El usuario a asignar no existe.', 404);
    if (Number(rolTecnico[0].Codigo_Rol) !== 1) {
        throw new AppError('Solo se puede asignar un usuario con rol Técnico (Rol 1) a una orden.', 400);
    }

    const result = await servicioDao.asignarTecnico(id, idTecnico);
    if (result.affectedRows === 0) throw new AppError('No se pudo asignar el técnico.', 500);
    return { message: `Técnico ${idTecnico} asignado correctamente al servicio ${id}.` };
};

module.exports = { listar, listarMisTecnico, misServicios, agregar, actualizar, asignarTecnico, cancelar, eliminar };
