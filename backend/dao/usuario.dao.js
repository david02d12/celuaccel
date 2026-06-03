const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Codigo_Rol FROM Usuario');

const findById = (id) =>
    query('SELECT ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Codigo_Rol FROM Usuario WHERE ID_Usuario = ?', [id]);

const findByUsername = (user) =>
    query('SELECT * FROM Usuario WHERE TRIM(ID_Usuario) = ?', [user]);

const getRol = (id) =>
    query('SELECT Codigo_Rol FROM Usuario WHERE ID_Usuario = ?', [id]);

const create = ({ ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, hashedClave, rolAsignado }) => {
    const fechaFmt = Fecha_Nacimiento
        ? new Date(Fecha_Nacimiento).toISOString().split('T')[0]
        : null;
    return query(
        `INSERT INTO Usuario (ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Contraseña, Codigo_Rol)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ID_Usuario, Codigo_Documento, Nombre, fechaFmt, Direccion, Telefono, Correo, hashedClave, rolAsignado]
    );
};

const update = ({ Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, hashedClave, Codigo_Rol, ID_Usuario }) => {
    const fechaFmt = Fecha_Nacimiento
        ? new Date(Fecha_Nacimiento).toISOString().split('T')[0]
        : null;
    if (hashedClave) {
        return query(
            `UPDATE Usuario SET Codigo_Documento=?, Nombre=?, Fecha_Nacimiento=?, Direccion=?, Telefono=?, Correo=?, Contraseña=?, Codigo_Rol=? WHERE ID_Usuario=?`,
            [Codigo_Documento, Nombre, fechaFmt, Direccion, Telefono, Correo, hashedClave, Codigo_Rol, ID_Usuario]
        );
    }
    return query(
        `UPDATE Usuario SET Codigo_Documento=?, Nombre=?, Fecha_Nacimiento=?, Direccion=?, Telefono=?, Correo=?, Codigo_Rol=? WHERE ID_Usuario=?`,
        [Codigo_Documento, Nombre, fechaFmt, Direccion, Telefono, Correo, Codigo_Rol, ID_Usuario]
    );
};

const updateMiPerfil = ({ Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, hashedClave, ID_Usuario }) => {
    const fechaFmt = Fecha_Nacimiento
        ? new Date(Fecha_Nacimiento).toISOString().split('T')[0]
        : null;
    if (hashedClave) {
        return query(
            `UPDATE Usuario SET Nombre=?, Fecha_Nacimiento=?, Direccion=?, Telefono=?, Correo=?, Contraseña=? WHERE ID_Usuario=?`,
            [Nombre, fechaFmt, Direccion, Telefono, Correo, hashedClave, ID_Usuario]
        );
    }
    return query(
        `UPDATE Usuario SET Nombre=?, Fecha_Nacimiento=?, Direccion=?, Telefono=?, Correo=? WHERE ID_Usuario=?`,
        [Nombre, fechaFmt, Direccion, Telefono, Correo, ID_Usuario]
    );
};

const remove = (id) =>
    query('DELETE FROM Usuario WHERE ID_Usuario = ?', [id]);

module.exports = { getAll, findById, findByUsername, getRol, create, update, updateMiPerfil, remove };
