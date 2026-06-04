const AppError = require('../config/AppError');
const notificacionDao = require('../dao/notificacion.dao');

const parsearPayload = (raw) => {
    try {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object') return p;
        return { texto: raw, para: null, leida: false, fecha: null, servicio: null };
    } catch {
        return { texto: raw || '', para: null, leida: false, fecha: null, servicio: null };
    }
};

const listar = async () => {
    const rows = await notificacionDao.getAll();
    return rows.map(n => ({ ...n, parsed: parsearPayload(n.Tipo_Notificacion) }));
};

const enviar = async ({ ID_Usuario_Destino, ID_Servicio, Mensaje }, userId) => {
    if (!ID_Usuario_Destino || !Mensaje) {
        throw new AppError('ID_Usuario_Destino y Mensaje son obligatorios.', 400);
    }
    const payload = {
        para: String(ID_Usuario_Destino).trim(),
        servicio: ID_Servicio || null,
        texto: Mensaje,
        leida: false,
        fecha: new Date().toISOString().split('T')[0],
        de: userId
    };
    const result = await notificacionDao.crearDirigida(payload);
    return { message: 'Notificacion enviada al cliente.', id: result.insertId };
};

const misNotificaciones = async (idUsuario) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    const all = await notificacionDao.getAll();
    return all
        .filter(n => {
            const p = parsearPayload(n.Tipo_Notificacion);
            return p.para && String(p.para).trim() === String(idUsuario).trim();
        })
        .map(n => {
            const p = parsearPayload(n.Tipo_Notificacion);
            return {
                Codigo_Notificaciones: n.Codigo_Notificaciones,
                parsed: {
                    texto: p.texto || '',
                    servicio: p.servicio || null,
                    leida: p.leida === true,
                    fecha: p.fecha || null
                }
            };
        });
};

const marcarLeida = async (id, userId) => {
    const rows = await notificacionDao.findById(id);
    if (rows.length === 0) throw new AppError('Notificacion no encontrada.', 404);
    const p = parsearPayload(rows[0].Tipo_Notificacion);
    if (p.para && String(p.para).trim() !== String(userId).trim()) {
        throw new AppError('Acceso denegado.', 403);
    }
    p.leida = true;
    await notificacionDao.updatePayload(id, p);
};

const agregar = async ({ Codigo_Notificaciones, Tipo_Notificacion }) => {
    if (!Tipo_Notificacion) {
        throw new AppError('El campo Tipo_Notificacion es obligatorio.', 400);
    }
    try {
        await notificacionDao.create({ Codigo_Notificaciones, Tipo_Notificacion });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('La notificacion ya existe.', 409);
        throw err;
    }
};

const actualizar = async ({ Tipo_Notificacion, Codigo_Notificaciones }) => {
    if (!Codigo_Notificaciones) throw new AppError('El campo Codigo_Notificaciones es obligatorio para actualizar.', 400);
    const result = await notificacionDao.update({ Tipo_Notificacion, Codigo_Notificaciones });
    if (result.affectedRows === 0) throw new AppError('Notificacion no encontrada.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID de la notificacion es obligatorio.', 400);
    const result = await notificacionDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Notificacion no encontrada.', 404);
};

module.exports = { listar, enviar, misNotificaciones, marcarLeida, agregar, actualizar, eliminar };
