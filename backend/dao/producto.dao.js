const { queryPromise: query } = require('../config/db');

// ── C1 FIX: INSERT con nombres de columna explícitos (compatible con nueva BD) ──
const getAll = () =>
    query('SELECT * FROM producto');

/** Solo los activos con stock (para el catálogo público) */
const getPublicos = () =>
    query('SELECT * FROM producto WHERE Activo_Catalogo = 1 AND Cantidad > 0');

const findById = (id) =>
    query('SELECT * FROM producto WHERE Codigo_Producto = ?', [id]);

const create = ({ Codigo_Producto, Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria }) =>
    query(
        `INSERT INTO producto
            (Codigo_Producto, Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [Codigo_Producto, Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria]
    );

// ── M6 FIX: UPDATE incluye todos los campos del esquema mejorado ──────────────
const update = ({ Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria, Codigo_Producto }) =>
    query(
        `UPDATE producto
         SET Nombre=?, Descripcion=?, Cantidad=?, Precio=?, Imagen=?, Activo_Catalogo=?, ID_Categoria=?
         WHERE Codigo_Producto=?`,
        [Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria, Codigo_Producto]
    );

const remove = (id) =>
    query('DELETE FROM producto WHERE Codigo_Producto = ?', [id]);

/**
 * Descuenta 'cantidad' unidades del stock.
 * Usa WHERE Cantidad >= ? para prevenir stock negativo (atómico).
 * Retorna affectedRows=0 si no hay stock suficiente.
 */
const descontarStock = (id, cantidad) =>
    query(
        'UPDATE producto SET Cantidad = Cantidad - ? WHERE Codigo_Producto = ? AND Cantidad >= ?',
        [cantidad, id, cantidad]
    );

module.exports = { getAll, getPublicos, findById, create, update, descontarStock, remove };
