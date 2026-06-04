const AppError = require('../config/AppError');
const preguntaDao = require('../dao/pregunta.dao');
const usuarioDao = require('../dao/usuario.dao');

const listar = () => preguntaDao.getAll();

const agregar = async (data, userId) => {
    const { ID_Usuario, Codigo_Producto, Pregunta } = data;
    if (!ID_Usuario || !Codigo_Producto || !Pregunta) {
        throw new AppError('Los campos ID_Usuario, Codigo_Producto y Pregunta son obligatorios.', 400);
    }
    if (!userId) throw new AppError('Usuario no autenticado.', 401);
    const rolRes = await usuarioDao.getRol(userId);
    const miRol = rolRes.length > 0 ? Number(rolRes[0].Codigo_Rol) : 2;
    if (String(ID_Usuario).trim() !== String(userId).trim() && miRol === 2) {
        throw new AppError('Acceso denegado: no puedes preguntar en nombre de otro usuario.', 403);
    }
    return preguntaDao.create({ ...data, ID_Usuario: userId });
};

const actualizar = async (data) => {
    if (!data.ID_Consulta) throw new AppError('El campo ID_Consulta es obligatorio para actualizar.', 400);
    const result = await preguntaDao.update(data);
    if (result.affectedRows === 0) throw new AppError('Pregunta no encontrada.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID de la consulta es obligatorio.', 400);
    const result = await preguntaDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Pregunta no encontrada.', 404);
};

const listarMias = async (userId) => {
    if (!userId) throw new AppError('Usuario no autenticado.', 401);
    return preguntaDao.getByUsuario(userId);
};

module.exports = { listar, listarMias, agregar, actualizar, eliminar };
