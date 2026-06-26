const { queryPromise: query } = require('../config/db');

// ── C1 FIX: INSERT con nombres de columna explícitos (compatible con nueva BD) ──
const getAll = () =>
    query('SELECT * FROM Producto');

/** Solo los activos con stock (para el catálogo público) */
const getPublicos = () =>
    query('SELECT * FROM Producto WHERE Activo_Catalogo = 1 AND Cantidad > 0');

const create = ({ Codigo_Producto, Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria }) =>
    query(
        `INSERT INTO Producto
            (Codigo_Producto, Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [Codigo_Producto, Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria]
    );

// ── M6 FIX: UPDATE incluye todos los campos del esquema mejorado ──────────────
const update = ({ Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria, Codigo_Producto }) =>
    query(
        `UPDATE Producto
         SET Nombre=?, Descripcion=?, Cantidad=?, Precio=?, Imagen=?, Activo_Catalogo=?, ID_Categoria=?
         WHERE Codigo_Producto=?`,
        [Nombre, Descripcion, Cantidad, Precio, Imagen, Activo_Catalogo, ID_Categoria, Codigo_Producto]
    );

const remove = (id) =>
    query('DELETE FROM Producto WHERE Codigo_Producto = ?', [id]);

module.exports = { getAll, getPublicos, create, update, remove };
