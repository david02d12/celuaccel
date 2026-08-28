const AppError = require('../config/AppError');
const notificacionDao = require('../dao/notificacion.dao');
const usuarioDao = require('../dao/usuario.dao');

const formatear = (n) => ({
    ID_Notificacion:       n.ID_Notificacion,
    Codigo_Notificaciones: n.ID_Notificacion, // Mantenido para retrocompatibilidad frontend
    ID_Usuario:            n.ID_Usuario_Destino    ?? null,
    ID_Usuario_Destino:    n.ID_Usuario_Destino    ?? null,
    ID_Servicio:           n.ID_Servicio            ?? null,
    Mensaje:               n.Mensaje                ?? null,
    Titulo:                n.Titulo                 ?? n.Mensaje ?? null,
    Leida:                 n.Leida ?? 0,
    Fecha:                 n.Fecha
        ? new Date(n.Fecha).toISOString()
        : null,
});

const listar = async () => {
    const rows = await notificacionDao.getAll();
    return rows.map(formatear);
};

const enviar = async ({ ID_Usuario_Destino, ID_Servicio, Mensaje }, userId) => {
    if (!ID_Usuario_Destino || !Mensaje) {
        throw new AppError('ID_Usuario_Destino y Mensaje son obligatorios.', 400);
    }

    const result = await notificacionDao.crearDirigida({
        ID_Usuario_Destino: String(ID_Usuario_Destino).trim(),
        ID_Usuario_Origen:  String(userId).trim(),
        ID_Servicio:        ID_Servicio || null,
        Mensaje:            Mensaje,
    });

    return { message: 'Notificación enviada al cliente.', id: result.insertId };
};

const agregar = async ({ ID_Usuario_Destino, ID_Servicio, Mensaje }, userId) => {
    if (!ID_Usuario_Destino || !Mensaje) {
        throw new AppError('Los campos ID_Usuario_Destino y Mensaje son obligatorios.', 400);
    }
    try {
        await notificacionDao.create({
            ID_Usuario_Destino: String(ID_Usuario_Destino).trim(),
            ID_Usuario_Origen:  String(userId).trim(),
            ID_Servicio:        ID_Servicio || null,
            Mensaje:            Mensaje,
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('La notificación ya existe.', 409);
        throw err;
    }
};

const actualizar = async ({ Mensaje, ID_Notificacion }) => {
    if (!ID_Notificacion) {
        throw new AppError('El campo ID_Notificacion es obligatorio para actualizar.', 400);
    }
    const result = await notificacionDao.update({ Mensaje, ID_Notificacion });
    if (result.affectedRows === 0) throw new AppError('Notificación no encontrada.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID de la notificación es obligatorio.', 400);
    const result = await notificacionDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Notificación no encontrada.', 404);
};

module.exports = { listar, enviar, agregar, actualizar, eliminar };
