const AppError = require('../config/AppError');
const historialDao = require('../dao/historial.dao');
const servicioDao = require('../dao/servicio.dao');

const listar = () => historialDao.getAll();

const ESTADOS_VALIDOS = ['Ingresado', 'En diagnóstico', 'En reparación', 'Control de calidad', 'Terminado', 'Cancelado'];

const agregar = async (data) => {
    if (!data.ID_Servicio || !data.Descripcion_Evento) {
        throw new AppError('Los campos ID_Servicio y Descripcion_Evento son obligatorios.', 400);
    }
    if (data.Estado && !ESTADOS_VALIDOS.includes(data.Estado)) {
        throw new AppError(`Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}.`, 400);
    }
    
    // Validar que el servicio exista
    const servicio = await servicioDao.findById(data.ID_Servicio);
    if (!servicio || servicio.length === 0) {
        throw new AppError(`El servicio #${data.ID_Servicio} no existe. No se puede crear el evento en la bitácora.`, 404);
    }
    // Fecha siempre generada por el servidor (NOW() en la query SQL)
    const { Fecha_Evento: _ignorado, ...dataLimpia } = data;
    return historialDao.create(dataLimpia);
};

const actualizar = async (data) => {
    if (!data.ID_Registro) throw new AppError('El campo ID_Registro es obligatorio para actualizar.', 400);
    if (data.Estado && !ESTADOS_VALIDOS.includes(data.Estado)) {
        throw new AppError(`Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}.`, 400);
    }
    const result = await historialDao.update(data);
    if (result.affectedRows === 0) throw new AppError('Registro de historial no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del historial es obligatorio.', 400);
    const result = await historialDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Registro de historial no encontrado.', 404);
};

module.exports = { listar, agregar, actualizar, eliminar };
