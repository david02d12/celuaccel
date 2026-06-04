const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Producto');

const create = ({ Codigo_Producto, Cantidad, Precio, Nombre, Descripcion, Imagen, Activo_Catalogo, ID_Categoria }) =>
    query(
        `INSERT INTO Producto VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [Codigo_Producto, Cantidad, Precio, Nombre, Descripcion, Imagen, Activo_Catalogo, ID_Categoria]
    );

const update = ({ Cantidad, Precio, Nombre, Descripcion, Imagen, Activo_Catalogo, ID_Categoria, Codigo_Producto }) =>
    query(
        `UPDATE Producto SET Cantidad=?, Precio=?, Nombre=?, Descripcion=?, Imagen=?, Activo_Catalogo=?, ID_Categoria=? WHERE Codigo_Producto=?`,
        [Cantidad, Precio, Nombre, Descripcion, Imagen, Activo_Catalogo, ID_Categoria, Codigo_Producto]
    );

const remove = (id) =>
    query('DELETE FROM Producto WHERE Codigo_Producto = ?', [id]);

module.exports = { getAll, create, update, remove };
