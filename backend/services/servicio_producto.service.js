const AppError = require('../config/AppError');
const spDao = require('../dao/servicio_producto.dao');
const servicioDao = require('../dao/servicio.dao');
const productoService = require('./producto.service');

/**
 * Lista los repuestos utilizados en un servicio.
 */
const listarPorServicio = async (idServicio) => {
    if (!idServicio) throw new AppError('El ID de servicio es obligatorio.', 400);
    return spDao.getByServicio(idServicio);
};

/**
 * RF-015: Registra el uso de un repuesto en una orden de servicio.
 * - Verifica que el servicio exista y no esté cancelado.
 * - Descuenta el stock del producto (RN-008 incluido via productoService).
 */
const agregar = async ({ ID_Servicio, Codigo_Producto, Cantidad }) => {
    if (!ID_Servicio || !Codigo_Producto) {
        throw new AppError('ID_Servicio y Codigo_Producto son obligatorios.', 400);
    }
    const cantidad = Number(Cantidad) || 1;

    // Verificar que el servicio exista y no esté cancelado
    const rows = await servicioDao.findById(ID_Servicio);
    if (rows.length === 0) throw new AppError('Servicio no encontrado.', 404);
    if (Number(rows[0].Etapa) === -1) {
        throw new AppError('No se pueden añadir repuestos a un servicio cancelado.', 409);
    }
    if (Number(rows[0].Etapa) === 100) {
        throw new AppError('El servicio ya está completado. No se pueden añadir más repuestos.', 409);
    }

    // RN-008/013: Descontar del inventario (lanza error si no hay stock)
    await productoService.descontarStock(Codigo_Producto, cantidad);

    // Registrar el uso en la tabla Servicio_Producto
    await spDao.agregar(ID_Servicio, Codigo_Producto, cantidad);
    return { message: `Repuesto registrado y stock descontado (${cantidad} unidad/es).` };
};

/**
 * RF-015: Elimina el registro de un repuesto de un servicio.
 * Nota: NO devuelve el stock — el descuento es una salida definitiva.
 */
const eliminar = async (idServicio, codigoProducto) => {
    if (!idServicio || !codigoProducto) {
        throw new AppError('ID_Servicio y Codigo_Producto son obligatorios.', 400);
    }
    await spDao.remove(idServicio, codigoProducto);
};

module.exports = { listarPorServicio, agregar, eliminar };
