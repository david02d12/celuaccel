const AppError = require('../config/AppError');
const rolesDao = require('../dao/roles.dao');

const listar = () => rolesDao.getAll();

const crear = async (Codigo_Rol, Descripcion_Rol) => {
    if (!Codigo_Rol || !Descripcion_Rol) {
        throw new AppError('Los campos Codigo_Rol y Descripcion_Rol son obligatorios.', 400);
    }
    try {
        await rolesDao.create(Codigo_Rol, Descripcion_Rol);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('El rol ya existe.', 409);
        throw err;
    }
};

const actualizar = async (Codigo_Rol, Descripcion_Rol) => {
    if (!Codigo_Rol || !Descripcion_Rol) {
        throw new AppError('Los campos Codigo_Rol y Descripcion_Rol son obligatorios.', 400);
    }
    const result = await rolesDao.update(Codigo_Rol, Descripcion_Rol);
    if (result.affectedRows === 0) throw new AppError('Rol no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del rol es obligatorio.', 400);
    const result = await rolesDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Rol no encontrado.', 404);
};

module.exports = { listar, crear, actualizar, eliminar };
