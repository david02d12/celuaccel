const AppError = require('../config/AppError');
const rolesDao = require('../dao/roles.dao');

const listar = () => rolesDao.getAll();

const crear = async (Codigo_Rol, Nombre_Rol) => {
    if (!Codigo_Rol || !Nombre_Rol) {
        throw new AppError('Los campos Codigo_Rol y Nombre_Rol son obligatorios.', 400);
    }
    try {
        await rolesDao.create(Codigo_Rol, Nombre_Rol);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('El rol ya existe.', 409);
        throw err;
    }
};

const actualizar = async (Codigo_Rol, Nombre_Rol) => {
    if (!Codigo_Rol || !Nombre_Rol) {
        throw new AppError('Los campos Codigo_Rol y Nombre_Rol son obligatorios.', 400);
    }
    const result = await rolesDao.update(Codigo_Rol, Nombre_Rol);
    if (result.affectedRows === 0) throw new AppError('Rol no encontrado.', 404);
};

/** FA-2: Bloquea la eliminación si el rol está asignado a algún usuario */
const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del rol es obligatorio.', 400);
    const enUso = await rolesDao.isEnUso(id);
    if (enUso.length > 0) {
        throw new AppError(
            'No se puede eliminar el rol porque está asignado a uno o más usuarios.',
            409
        );
    }
    const result = await rolesDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Rol no encontrado.', 404);
};

module.exports = { listar, crear, actualizar, eliminar };

