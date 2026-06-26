const AppError = require('../config/AppError');
const chatDao = require('../dao/chat.dao');

const listar = () => chatDao.getAll();

const listarMios = async (idUsuario) => {
    if (!idUsuario) throw new AppError('Usuario no autenticado.', 401);
    const results = await chatDao.getMios(idUsuario);
    const vistos = new Set();
    return results.filter(r => {
        if (vistos.has(r.Codigo_Chat)) return false;
        vistos.add(r.Codigo_Chat);
        return true;
    });
};

const agregar = async ({ ID_Usuario, ID_Servicio }) => {
    if (!ID_Usuario) {
        throw new AppError('El campo ID_Usuario es obligatorio.', 400);
    }
    // Chats de catálogo (sin servicio asociado): siempre crear uno nuevo
    if (ID_Servicio === null || ID_Servicio === undefined) {
        const result = await chatDao.create(ID_Usuario, null);
        return { message: 'Chat de consulta creado correctamente.', id: result.insertId, existente: false };
    }
    // Chats de servicio: evitar duplicados
    const existing = await chatDao.findByServicio(ID_Servicio);
    if (existing.length > 0) {
        return { message: 'Ya existe un chat para este servicio.', id: existing[0].Codigo_Chat, existente: true };
    }
    const result = await chatDao.create(ID_Usuario, ID_Servicio);
    return { message: 'Chat creado correctamente.', id: result.insertId, existente: false };
};

const actualizar = async (data) => {
    if (!data.Codigo_Chat) throw new AppError('El campo Codigo_Chat es obligatorio para actualizar.', 400);
    const result = await chatDao.update(data);
    if (result.affectedRows === 0) throw new AppError('Chat no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID del chat es obligatorio.', 400);
    const result = await chatDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Chat no encontrado.', 404);
};

module.exports = { listar, listarMios, agregar, actualizar, eliminar };
