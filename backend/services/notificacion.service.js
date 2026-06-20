const AppError = require('../config/AppError');
const notificacionDao = require('../dao/notificacion.dao');
const usuarioDao = require('../dao/usuario.dao');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Formatea una fila de BD al shape que espera el frontend */
const formatear = (n) => ({
    Codigo_Notificaciones: n.Codigo_Notificaciones,
    ID_Usuario:            n.ID_Usuario_Destino    ?? null,
    ID_Usuario_Destino:    n.ID_Usuario_Destino    ?? null,
    ID_Servicio:           n.ID_Servicio            ?? null,
    Tipo_Notificacion:     n.Tipo_Notificacion      ?? null,
    Titulo:                n.Titulo                 ?? n.Tipo_Notificacion ?? null,
    Mensaje:               n.Mensaje                ?? n.Tipo_Notificacion ?? null,
    Leida:                 n.Leida ?? 0,
    Fecha_Notificacion:    n.Fecha_Notificacion
        ? new Date(n.Fecha_Notificacion).toISOString()
        : null,
    Fecha:                 n.Fecha_Notificacion
        ? new Date(n.Fecha_Notificacion).toISOString()
        : null,
});

// ─── SERVICIOS ────────────────────────────────────────────────────────────────

/**
 * Listar TODAS las notificaciones (solo admin/técnico).
 * Devuelve el array formateado.
 */
const listar = async () => {
    const rows = await notificacionDao.getAll();
    return rows.map(formatear);
};

/**
 * Envía una notificación dirigida a un usuario específico.
 * Solo técnicos y administradores pueden enviarlas.
 *
 * Body esperado: { ID_Usuario_Destino, ID_Servicio?, Mensaje }
 */
const enviar = async ({ ID_Usuario_Destino, ID_Servicio, Mensaje }, userId) => {
    if (!ID_Usuario_Destino || !Mensaje) {
        throw new AppError('ID_Usuario_Destino y Mensaje son obligatorios.', 400);
    }

    const result = await notificacionDao.crearDirigida({
        ID_Usuario_Destino: String(ID_Usuario_Destino).trim(),
        ID_Usuario_Origen:  String(userId).trim(),
        ID_Servicio:        ID_Servicio || null,
        Tipo_Notificacion:  Mensaje,
    });

    return { message: 'Notificación enviada al cliente.', id: result.insertId };
};

/**
 * Devuelve las notificaciones del usuario autenticado.
 * Se hace la consulta directamente en SQL (no se descarga todo y se filtra en JS).
 *
 * @param {string}  idUsuario
 * @param {boolean} [soloNoLeidas=false]  - true para el badge de contador
 */
const misNotificaciones = async (idUsuario, soloNoLeidas = false) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    const rows = await notificacionDao.getByUsuario(idUsuario, soloNoLeidas);
    return rows.map(formatear);
};

/**
 * Devuelve el total de notificaciones no leídas (para badge en frontend).
 * M5 FIX: COUNT(*) en mysql2 devuelve BigInt — se fuerza a Number para JSON.
 */
const contarNoLeidas = async (idUsuario) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    const rows = await notificacionDao.contarNoLeidas(idUsuario);
    const count = Number(rows[0]?.total ?? 0);
    // Devolver ambas claves para compatibilidad frontend web y móvil
    return { count, total: count };
};

/**
 * Marca una notificación como leída.
 * Solo el dueño o un admin/técnico puede marcarla.
 */
const marcarLeida = async (id, userId) => {
    if (!id) throw new AppError('El ID de la notificación es obligatorio.', 400);

    const rows = await notificacionDao.findById(id);
    if (rows.length === 0) throw new AppError('Notificación no encontrada.', 404);

    const noti = rows[0];

    // Verificar propiedad: solo el destinatario o un admin/técnico
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

/**
 * Marca TODAS las notificaciones del usuario autenticado como leídas.
 * Útil para el botón "Marcar todas como leídas" en el frontend.
 */
const marcarTodasLeidas = async (idUsuario) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    await notificacionDao.marcarTodasLeidas(idUsuario);
};

/**
 * Crea una notificación de plantilla/global (CRUD admin).
 * No tiene destinatario específico.
 */
const agregar = async ({ Tipo_Notificacion }) => {
    if (!Tipo_Notificacion) {
        throw new AppError('El campo Tipo_Notificacion es obligatorio.', 400);
    }
    try {
        await notificacionDao.create({ Tipo_Notificacion });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('La notificación ya existe.', 409);
        throw err;
    }
};

/** Actualiza el texto de una notificación (CRUD admin) */
const actualizar = async ({ Tipo_Notificacion, Codigo_Notificaciones }) => {
    if (!Codigo_Notificaciones) {
        throw new AppError('El campo Codigo_Notificaciones es obligatorio para actualizar.', 400);
    }
    const result = await notificacionDao.update({ Tipo_Notificacion, Codigo_Notificaciones });
    if (result.affectedRows === 0) throw new AppError('Notificación no encontrada.', 404);
};

/** Elimina una notificación por ID */
const eliminar = async (id) => {
    if (!id) throw new AppError('El ID de la notificación es obligatorio.', 400);
    const result = await notificacionDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Notificación no encontrada.', 404);
};

module.exports = {
    listar,
    enviar,
    misNotificaciones,
    contarNoLeidas,
    marcarLeida,
    marcarTodasLeidas,
    agregar,
    actualizar,
    eliminar,
};
