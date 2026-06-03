const AppError = require('../config/AppError');
const categoriaDao = require('../dao/categoria.dao');

const listar = () => categoriaDao.getAll();

const agregar = async ({ ID_Categoria, Nombre_Categoria }) => {
    if (!ID_Categoria || !Nombre_Categoria) {
        throw new AppError('Los campos ID_Categoria y Nombre_Categoria son obligatorios.', 400);
    }
    try {
        await categoriaDao.create(ID_Categoria, Nombre_Categoria);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('La categoría ya existe.', 409);
        throw err;
    }
};

const actualizar = async ({ ID_Categoria, Nombre_Categoria }) => {
    if (!ID_Categoria || !Nombre_Categoria) {
        throw new AppError('Los campos ID_Categoria y Nombre_Categoria son obligatorios.', 400);
    }
    const result = await categoriaDao.update(ID_Categoria, Nombre_Categoria);
    if (result.affectedRows === 0) throw new AppError('Categoría no encontrada.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El ID de la categoría es obligatorio.', 400);
    const result = await categoriaDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Categoría no encontrada.', 404);
};

module.exports = { listar, agregar, actualizar, eliminar };
