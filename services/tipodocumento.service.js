const AppError = require('../config/AppError');
const tipoDao = require('../dao/tipodocumento.dao');

const listar = () => tipoDao.getAll();

const agregar = async ({ Codigo_Documento, Nombre_Documento }) => {
    if (!Codigo_Documento || !Nombre_Documento) {
        throw new AppError('Los campos Codigo_Documento y Nombre_Documento son obligatorios.', 400);
    }
    try {
        await tipoDao.create(Codigo_Documento, Nombre_Documento);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('El tipo de documento ya existe.', 409);
        throw err;
    }
};

const actualizar = async ({ Codigo_Documento, Nombre_Documento }) => {
    if (!Codigo_Documento || !Nombre_Documento) {
        throw new AppError('Los campos Codigo_Documento y Nombre_Documento son obligatorios.', 400);
    }
    const result = await tipoDao.update(Codigo_Documento, Nombre_Documento);
    if (result.affectedRows === 0) throw new AppError('Tipo de documento no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del tipo de documento es obligatorio.', 400);
    const result = await tipoDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Tipo de documento no encontrado.', 404);
};

module.exports = { listar, agregar, actualizar, eliminar };
