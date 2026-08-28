const AppError = require('../config/AppError');
const preguntaDao = require('../dao/pregunta.dao');
const usuarioDao = require('../dao/usuario.dao');

const listar = () => preguntaDao.getAll();

const agregar = async (data, userId) => {
    const { ID_Usuario, Codigo_Producto, Pregunta } = data;
    if (!ID_Usuario || !Pregunta) {
        throw new AppError('Los campos ID_Usuario y Pregunta son obligatorios.', 400);
    }
    if (!userId) throw new AppError('Usuario no autenticado.', 401);
    const rolRes = await usuarioDao.getRol(userId);
    const miRol = rolRes.length > 0 ? Number(rolRes[0].Codigo_Rol) : 2;
    if (String(ID_Usuario).trim() !== String(userId).trim() && miRol === 2) {
        throw new AppError('Acceso denegado: no puedes preguntar en nombre de otro usuario.', 403);
    }
    // C4 FIX: Técnicos/admins pueden registrar preguntas con el ID_Usuario enviado.
    // Clientes solo pueden registrar para sí mismos (ya validado arriba).
    const idFinal = (miRol === 1 || miRol === 3) ? String(ID_Usuario).trim() : userId;
    try {
        return await preguntaDao.create({ ...data, ID_Usuario: idFinal, Codigo_Producto: Codigo_Producto || 'GENERAL' });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new AppError('El código de producto ingresado no existe en el catálogo.', 400);
        }
        throw error;
    }
};

const actualizar = async (data, userId) => {
    const { ID_Consulta, ID_Usuario } = data;
    if (!ID_Consulta) throw new AppError('El campo ID_Consulta es obligatorio para actualizar.', 400);
    if (!userId) throw new AppError('Usuario no autenticado.', 401);

    // El cliente solo puede modificar sus propias preguntas; técnicos/admins pueden editar cualquiera.
    const rolRes = await usuarioDao.getRol(userId);
    const miRol = rolRes.length > 0 ? Number(rolRes[0].Codigo_Rol) : 2;
    if (miRol === 2 && String(ID_Usuario).trim() !== String(userId).trim()) {
        throw new AppError('Acceso denegado: no puedes modificar preguntas de otro usuario.', 403);
    }

    const result = await preguntaDao.update({
        ...data,
        ID_Usuario: (miRol === 1 || miRol === 3) ? String(ID_Usuario).trim() : userId,
        Codigo_Producto: data.Codigo_Producto || 'GENERAL',
    });
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

/** El técnico registra la respuesta a una pregunta del catálogo */
const responder = async ({ ID_Consulta, Respuesta }, userId) => {
    if (!ID_Consulta || !Respuesta || !Respuesta.trim()) {
        throw new AppError('Los campos ID_Consulta y Respuesta son obligatorios.', 400);
    }
    const result = await preguntaDao.responder({
        ID_Consulta,
        Respuesta: Respuesta.trim(),
        ID_Tecnico_Responde: userId
    });
    if (result.affectedRows === 0) throw new AppError('Pregunta no encontrada.', 404);
};

module.exports = { listar, listarMias, agregar, actualizar, responder, eliminar };
