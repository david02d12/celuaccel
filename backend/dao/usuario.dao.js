const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Codigo_Rol FROM Usuario');

const findById = (id) =>
    query('SELECT ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Codigo_Rol FROM Usuario WHERE ID_Usuario = ?', [id]);

const findByUsername = (user) =>
    query('SELECT * FROM Usuario WHERE TRIM(ID_Usuario) = ? OR TRIM(Correo) = ?', [user, user]);

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

const findByEmail = (email) =>
    query('SELECT * FROM Usuario WHERE TRIM(Correo) = ?', [email]);

const updatePassword = (id, hashedClave) =>
    query('UPDATE Usuario SET Contraseña = ? WHERE ID_Usuario = ?', [hashedClave, id]);

const remove = async (id) => {
    // Eliminar en cascada: primero los registros hijos en orden de dependencia
    // 1. Historial_Servicios depende de Servicio (que depende de Usuario)
    await query(
        'DELETE hs FROM Historial_Servicios hs INNER JOIN Servicio s ON hs.ID_Servicio = s.ID_Servicio WHERE s.ID_Usuario = ?',
        [id]
    );
    // 2. Mensajes depende de Chat (que depende de Usuario) y también de Usuario directamente
    await query(
        'DELETE m FROM Mensajes m INNER JOIN Chat c ON m.Codigo_Chat = c.Codigo_Chat WHERE c.ID_Usuario = ?',
        [id]
    );
    // Mensajes donde el usuario es autor pero en chats de otros
    await query('DELETE FROM Mensajes WHERE ID_Usuario = ?', [id]);
    // 3. Chat depende de Usuario
    await query('DELETE FROM Chat WHERE ID_Usuario = ?', [id]);
    // 4. Servicio depende de Usuario
    await query('DELETE FROM Servicio WHERE ID_Usuario = ?', [id]);
    // 5. Comentarios depende de Usuario
    await query('DELETE FROM Comentarios WHERE ID_Usuario = ?', [id]);
    // 6. Pregunta depende de Usuario
    await query('DELETE FROM Pregunta WHERE ID_Usuario = ?', [id]);
    // 7. Finalmente eliminar el usuario
    return query('DELETE FROM Usuario WHERE ID_Usuario = ?', [id]);
};

module.exports = { getAll, findById, findByUsername, getRol, create, update, updateMiPerfil, findByEmail, updatePassword, remove };

