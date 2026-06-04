const AppError = require('../config/AppError');
const mensajeDao = require('../dao/mensaje.dao');

const listar = () => mensajeDao.getAll();

const agregar = async ({ Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado }) => {
    if (!Codigo_Chat || !ID_Usuario || !Mensaje) {
        throw new AppError('Los campos Codigo_Chat, ID_Usuario y Mensaje son obligatorios.', 400);
    }
    const fecha = Fecha_Mensaje || new Date().toISOString().split('T')[0];
    const result = await mensajeDao.create({ Codigo_Chat, ID_Usuario, Fecha_Mensaje: fecha, Mensaje, Estado });
    return { message: 'Mensaje enviado correctamente.', id: result.insertId };
};

const actualizar = async (data) => {
    if (!data.Codigo_Mensaje) throw new AppError('El campo Codigo_Mensaje es obligatorio para actualizar.', 400);
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

module.exports = { listar, listarPorChat, agregar, actualizar, eliminar };
