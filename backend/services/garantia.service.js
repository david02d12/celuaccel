const AppError = require('../config/AppError');
const garantiaDao = require('../dao/garantia.dao');
const servicioDao = require('../dao/servicio.dao');
const usuarioDao = require('../dao/usuario.dao');

/** RF-022: Lista todas las garantías (admin/técnico) */
const listar = () => garantiaDao.getAll();

/** RF-022: Garantías de un servicio específico */
const listarPorServicio = async (idServicio) => {
    if (!idServicio) throw new AppError('El ID de servicio es obligatorio.', 400);
    return garantiaDao.getByServicio(idServicio);
};

/** RF-022: Garantías propias del cliente autenticado */
const misGarantias = async (idUsuario) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    return garantiaDao.getByUsuario(idUsuario);
};

/**
 * RF-022: Crea una garantía vinculada a un servicio.
 * Solo se puede emitir garantía sobre un servicio completado (Etapa=100).
 */
const crear = async ({ ID_Servicio, Fecha_Inicio, Fecha_Fin, Descripcion_Garantia }, userId) => {
    if (!ID_Servicio || !Fecha_Inicio || !Fecha_Fin || !Descripcion_Garantia) {
        throw new AppError('ID_Servicio, Fecha_Inicio, Fecha_Fin y Descripcion_Garantia son obligatorios.', 400);
    }

    // Validar que el servicio exista y esté completado
    const rows = await servicioDao.findById(ID_Servicio);
    if (rows.length === 0) throw new AppError('Servicio no encontrado.', 404);
    if (Number(rows[0].Etapa) !== 100) {
        throw new AppError(
            'Solo se puede registrar una garantía sobre un servicio completado (Etapa 100).',
            409
        );
    }

    // Validar que Fecha_Fin sea posterior a Fecha_Inicio
    if (new Date(Fecha_Fin) <= new Date(Fecha_Inicio)) {
        throw new AppError('La fecha de fin de garantía debe ser posterior a la fecha de inicio.', 400);
    }

    const result = await garantiaDao.create({ ID_Servicio, Fecha_Inicio, Fecha_Fin, Descripcion_Garantia });
    return { message: 'Garantía registrada correctamente.', id: result.insertId };
};

/** RF-022: Actualiza datos de una garantía */
const actualizar = async (data) => {
    if (!data.ID_Garantia) throw new AppError('El campo ID_Garantia es obligatorio.', 400);
    if (data.Fecha_Fin && data.Fecha_Inicio && new Date(data.Fecha_Fin) <= new Date(data.Fecha_Inicio)) {
        throw new AppError('La fecha de fin debe ser posterior a la fecha de inicio.', 400);
    }
    const result = await garantiaDao.update(data);
    if (result.affectedRows === 0) throw new AppError('Garantía no encontrada.', 404);
};

/** RF-022: Elimina una garantía (solo admin) */
const eliminar = async (id) => {
    if (!id) throw new AppError('El ID de la garantía es obligatorio.', 400);
    const result = await garantiaDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Garantía no encontrada.', 404);
};

/** RF-022: Verifica si un servicio tiene garantía vigente */
const verificarVigencia = async (idServicio) => {
    if (!idServicio) throw new AppError('El ID de servicio es obligatorio.', 400);
    const rows = await garantiaDao.getByServicio(idServicio);
    if (rows.length === 0) return { vigente: false, garantia: null };
    const hoy = new Date();
    const garantia = rows.find(g => new Date(g.Fecha_Fin) >= hoy);
    return {
        vigente: !!garantia,
        garantia: garantia || null,
        expirada: !garantia ? rows[0] : null,
    };
};

module.exports = { listar, listarPorServicio, misGarantias, crear, actualizar, eliminar, verificarVigencia };
