const { queryPromise: query } = require('../config/db');

/** Obtener todos los repuestos de un servicio */
const getByServicio = (idServicio) =>
    query(
        `SELECT sp.ID_Servicio, sp.Codigo_Producto, sp.Cantidad,
                p.Nombre AS Nombre_Producto, p.Precio
         FROM servicio_producto sp
         JOIN producto p ON p.Codigo_Producto = sp.Codigo_Producto
         WHERE sp.ID_Servicio = ?`,
        [idServicio]
    );

/** Registra que se usó un repuesto en un servicio */
const agregar = (idServicio, codigoProducto, cantidad) =>
    query(
        `INSERT INTO servicio_producto (ID_Servicio, Codigo_Producto, Cantidad)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE Cantidad = Cantidad + VALUES(Cantidad)`,
        [idServicio, codigoProducto, cantidad]
    );

/** Elimina un repuesto de un servicio */
const remove = (idServicio, codigoProducto) =>
    query(
        'DELETE FROM servicio_producto WHERE ID_Servicio = ? AND Codigo_Producto = ?',
        [idServicio, codigoProducto]
    );

/** Elimina todos los repuestos de un servicio */
const removeByServicio = (idServicio) =>
    query('DELETE FROM servicio_producto WHERE ID_Servicio = ?', [idServicio]);

module.exports = { getByServicio, agregar, remove, removeByServicio };
