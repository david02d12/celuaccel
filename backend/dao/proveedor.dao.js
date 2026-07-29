const { queryPromise: query } = require('../config/db');

// ── Proveedor ────────────────────────────────────────────────────────────────

const getAllProveedores = () =>
    query('SELECT * FROM Proveedor ORDER BY Nombre_Empresa');

const findProveedorById = (id) =>
    query('SELECT * FROM Proveedor WHERE ID_Proveedor = ?', [id]);

const createProveedor = ({ Nombre_Empresa, NIT, Telefono, Correo, Direccion, Contacto }) =>
    query(
        `INSERT INTO Proveedor (Nombre_Empresa, NIT, Telefono, Correo, Direccion, Contacto)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [Nombre_Empresa, NIT, Telefono, Correo, Direccion, Contacto]
    );

const updateProveedor = ({ ID_Proveedor, Nombre_Empresa, NIT, Telefono, Correo, Direccion, Contacto }) =>
    query(
        `UPDATE Proveedor
         SET Nombre_Empresa=?, NIT=?, Telefono=?, Correo=?, Direccion=?, Contacto=?
         WHERE ID_Proveedor=?`,
        [Nombre_Empresa, NIT, Telefono, Correo, Direccion, Contacto, ID_Proveedor]
    );

const removeProveedor = (id) =>
    query('DELETE FROM Proveedor WHERE ID_Proveedor = ?', [id]);

// ── Compra ───────────────────────────────────────────────────────────────────

const getAllCompras = () =>
    query(`
        SELECT c.*, p.Nombre_Empresa AS Nombre_Proveedor, pr.Nombre AS Nombre_Producto
        FROM Compra c
        JOIN Proveedor p  ON p.ID_Proveedor = c.ID_Proveedor
        JOIN Producto  pr ON pr.Codigo_Producto = c.Codigo_Producto
        ORDER BY c.Fecha_Compra DESC
    `);

const getComprasByProveedor = (idProveedor) =>
    query('SELECT * FROM Compra WHERE ID_Proveedor = ? ORDER BY Fecha_Compra DESC', [idProveedor]);

const findCompraById = (id) =>
    query('SELECT * FROM Compra WHERE ID_Compra = ?', [id]);

const createCompra = ({ ID_Proveedor, Codigo_Producto, Cantidad, Precio_Unitario, Fecha_Compra }) =>
    query(
        `INSERT INTO Compra (ID_Proveedor, Codigo_Producto, Cantidad, Precio_Unitario, Fecha_Compra)
         VALUES (?, ?, ?, ?, ?)`,
        [ID_Proveedor, Codigo_Producto, Cantidad, Precio_Unitario, Fecha_Compra || new Date()]
    );

const removeCompra = (id) =>
    query('DELETE FROM Compra WHERE ID_Compra = ?', [id]);

module.exports = {
    getAllProveedores, findProveedorById, createProveedor, updateProveedor, removeProveedor,
    getAllCompras, getComprasByProveedor, findCompraById, createCompra, removeCompra,
};
