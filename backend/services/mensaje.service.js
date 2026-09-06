const AppError = require('../config/AppError');
const mensajeDao = require('../dao/mensaje.dao');
const usuarioDao = require('../dao/usuario.dao');

const listar = () => mensajeDao.getAll();

const agregar = async ({ Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado }) => {
    if (!Codigo_Chat || !ID_Usuario || !Mensaje) {
        throw new AppError('Los campos Codigo_Chat, ID_Usuario y Mensaje son obligatorios.', 400);
    }
    // Estado: 0 = no leído (recién enviado), 1 = leído — BD usa TINYINT(1)
    // Los mensajes nuevos siempre se crean con Estado=0
    const estadoInt = (Estado === 1 || Estado === true || String(Estado).toLowerCase().includes('le') && !String(Estado).toLowerCase().includes('env'))
        ? 1
        : 0;
    // Fecha_Mensaje: guardar como DATETIME completo para la nueva BD
    const fecha = Fecha_Mensaje || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const result = await mensajeDao.create({ Codigo_Chat, ID_Usuario, Fecha_Mensaje: fecha, Mensaje, Estado: estadoInt });
    return { message: 'Mensaje enviado correctamente.', id: result.insertId };
};

const actualizar = async (data, userId) => {
    if (!data.Codigo_Mensaje) throw new AppError('El campo Codigo_Mensaje es obligatorio para actualizar.', 400);
    // Verificar propiedad: solo el autor del mensaje o técnico/admin puede editar
    const rows = await mensajeDao.findWithOwnerCheck(data.Codigo_Mensaje, userId);
    if (rows.length === 0) throw new AppError('Mensaje no encontrado.', 404);
    const { dueno, rol } = rows[0];
    if (rol === 2 && String(dueno) !== String(userId)) {
        throw new AppError('No puedes editar mensajes de otro usuario.', 403);
    }
    const result = await mensajeDao.update(data);
    if (result.affectedRows === 0) throw new AppError('Mensaje no encontrado.', 404);
};

const eliminar = async (id, userId) => {
    if (!id) throw new AppError('El ID del mensaje es obligatorio.', 400);
    const rows = await mensajeDao.findWithOwnerCheck(id, userId);
    if (rows.length === 0) throw new AppError('Mensaje no encontrado.', 404);
    const { dueno, rol } = rows[0];
    if (rol === 2 && String(dueno) !== String(userId)) {
        throw new AppError('No puedes eliminar mensajes de otro usuario.', 403);
    }
    const result = await mensajeDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Mensaje no encontrado.', 404);
};

const listarPorChat = async (codigoChat) => {
    if (!codigoChat) throw new AppError('El ID del chat es obligatorio.', 400);
    return mensajeDao.getByChat(codigoChat);
};

const marcarLeidos = async (codigoChat, userId) => {
    if (!codigoChat) throw new AppError('El ID del chat es obligatorio.', 400);
    if (!userId) throw new AppError('El ID del usuario es obligatorio.', 400);
    return mensajeDao.marcarLeidos(codigoChat, userId);
};

const noLeidosGlobal = async (userId) => {
    if (!userId) throw new AppError('El ID del usuario es obligatorio.', 400);
    const rolRes = await usuarioDao.getRol(userId);
    const rol = rolRes.length > 0 ? rolRes[0].Codigo_Rol : 2;
    const res = await mensajeDao.contarNoLeidosGlobal(userId, rol);
    return { total: res.length > 0 ? res[0].total : 0 };
};

module.exports = { listar, listarPorChat, agregar, actualizar, eliminar, marcarLeidos, noLeidosGlobal };
