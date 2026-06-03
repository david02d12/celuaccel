const AppError = require('../config/AppError');
const productoDao = require('../dao/producto.dao');

const listar = () => productoDao.getAll();

const agregar = async (data) => {
    if (!data.Codigo_Producto || !data.Nombre || !data.Precio) {
        throw new AppError('Los campos Codigo_Producto, Nombre y Precio son obligatorios.', 400);
    }
    try {
        await productoDao.create(data);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('El producto ya existe.', 409);
        throw err;
    }
};

const actualizar = async (data) => {
    if (!data.Codigo_Producto) throw new AppError('El campo Codigo_Producto es obligatorio para actualizar.', 400);
    const result = await productoDao.update(data);
    if (result.affectedRows === 0) throw new AppError('Producto no encontrado.', 404);
};

const eliminar = async (id) => {
    if (!id) throw new AppError('El código del producto es obligatorio.', 400);
    const result = await productoDao.remove(id);
    if (result.affectedRows === 0) throw new AppError('Producto no encontrado.', 404);
};

module.exports = { listar, agregar, actualizar, eliminar };
