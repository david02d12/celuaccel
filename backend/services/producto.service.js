const AppError = require('../config/AppError');
const productoDao = require('../dao/producto.dao');

/** Todos los productos (admin/técnico) */
const listar = () => productoDao.getAll();

/** Solo activos con stock > 0 (catálogo público) */
const listarPublicos = () => productoDao.getPublicos();

const agregar = async (data) => {
    if (!data.Codigo_Producto || !data.Nombre || !data.Precio) {
        throw new AppError('Los campos Codigo_Producto, Nombre y Precio son obligatorios.', 400);
    }
    // RN-008: no se permite registrar con cantidad negativa
    if (data.Cantidad !== undefined && Number(data.Cantidad) < 0) {
        throw new AppError('La cantidad inicial del producto no puede ser negativa.', 400);
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

/**
 * RN-008: Descuenta stock de un producto. Falla si la cantidad
 * actual es 0 o si no hay suficiente para el descuento solicitado.
 */
const descontarStock = async (codigoProducto, cantidad = 1) => {
    if (!codigoProducto) throw new AppError('El código del producto es obligatorio.', 400);
    if (cantidad <= 0)   throw new AppError('La cantidad a descontar debe ser mayor a cero.', 400);

    // Verificar existencia y stock actual
    const rows = await productoDao.findById(codigoProducto);
    if (rows.length === 0) throw new AppError('Producto no encontrado.', 404);

    const stockActual = Number(rows[0].Cantidad);
    if (stockActual === 0) {
        throw new AppError(
            `No se puede realizar la salida: el producto "${rows[0].Nombre}" no tiene stock disponible (RN-008).`,
            409
        );
    }
    if (stockActual < cantidad) {
        throw new AppError(
            `Stock insuficiente. Disponible: ${stockActual} unidad(es) — Solicitado: ${cantidad}.`,
            409
        );
    }

    const result = await productoDao.descontarStock(codigoProducto, cantidad);
    if (result.affectedRows === 0) {
        throw new AppError('No se pudo descontar el stock (posible condición de carrera). Intenta de nuevo.', 409);
    }
    return { message: `Stock actualizado. Unidades descontadas: ${cantidad}.` };
};

module.exports = { listar, listarPublicos, agregar, actualizar, descontarStock, eliminar };
