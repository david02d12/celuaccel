const AppError = require('../config/AppError');
const historialDao = require('../dao/historial.dao');

const listar = () => historialDao.getAll();

const agregar = async (data) => {
    if (!data.ID_Servicio || !data.Descripcion_Evento) {
        throw new AppError('Los campos ID_Servicio y Descripcion_Evento son obligatorios.', 400);
    }
    return historialDao.create(data);
};

const actualizar = async (data) => {
    if (!data.ID_Historial) throw new AppError('El campo ID_Historial es obligatorio para actualizar.', 400);
    const result = await historialDao.update(data);
    if (result.affectedRows === 0) throw new AppError('Registro de historial no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del historial es obligatorio.', 400);
    const result = await historialDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Registro de historial no encontrado.', 404);
};

module.exports = { listar, agregar, actualizar, eliminar };
