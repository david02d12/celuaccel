const AppError = require('../config/AppError');
const tipoDao = require('../dao/tipodocumento.dao');

const listar = () => tipoDao.getAll();

const agregar = async ({ Codigo_Documento, Tipo_Documento }) => {
    if (!Codigo_Documento || !Tipo_Documento) {
        throw new AppError('Los campos Codigo_Documento y Tipo_Documento son obligatorios.', 400);
    }
    try {
        await tipoDao.create(Codigo_Documento, Tipo_Documento);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('El tipo de documento ya existe.', 409);
        throw err;
    }
};

const actualizar = async ({ Codigo_Documento, Tipo_Documento }) => {
    if (!Codigo_Documento || !Tipo_Documento) {
        throw new AppError('Los campos Codigo_Documento y Tipo_Documento son obligatorios.', 400);
    }
    const result = await tipoDao.update(Codigo_Documento, Tipo_Documento);
    if (result.affectedRows === 0) throw new AppError('Tipo de documento no encontrado.', 404);
};

/** FA-2: Bloquea la eliminación si el tipo está asignado a algún usuario */
const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del tipo de documento es obligatorio.', 400);
    const enUso = await tipoDao.isEnUso(id);
    if (enUso.length > 0) {
        throw new AppError(
            'No se puede eliminar el tipo de documento porque está asignado a uno o más usuarios.',
            409
        );
    }
    const result = await tipoDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Tipo de documento no encontrado.', 404);
};

module.exports = { listar, agregar, actualizar, eliminar };

