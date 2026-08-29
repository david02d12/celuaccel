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

const misNotificaciones = async (idUsuario, soloNoLeidas = false) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    const rows = await notificacionDao.getByUsuario(idUsuario, soloNoLeidas);
    return rows.map(formatear);
};

const contarNoLeidas = async (idUsuario) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    const rows = await notificacionDao.contarNoLeidas(idUsuario);
    const count = Number(rows[0]?.total ?? 0);
    // Devolver ambas claves para compatibilidad frontend web y móvil
    return { count, total: count };
};

const marcarLeida = async (id, userId) => {
    if (!id) throw new AppError('El ID de la notificación es obligatorio.', 400);

    const rows = await notificacionDao.findById(id);
    if (rows.length === 0) throw new AppError('Notificación no encontrada.', 404);

    const noti = rows[0];

    if (noti.ID_Usuario_Destino) {
        const esDueno = String(noti.ID_Usuario_Destino).trim() === String(userId).trim();
        if (!esDueno) {
            const rolRes = await usuarioDao.getRol(userId);
            const rol = rolRes[0]?.Codigo_Rol;
            if (rol !== 1 && rol !== 3) {
                throw new AppError('Acceso denegado.', 403);
            }
        }
    }

    await notificacionDao.marcarLeida(id);
};

const marcarTodasLeidas = async (idUsuario) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    await notificacionDao.marcarTodasLeidas(idUsuario);
};

module.exports = {
    misNotificaciones,
    contarNoLeidas,
    marcarLeida,
    marcarTodasLeidas,
};
