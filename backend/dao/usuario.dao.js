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

const findByEmail = (email) =>
    query('SELECT * FROM Usuario WHERE TRIM(Correo) = ?', [email]);

const updatePassword = (id, hashedClave) =>
    query('UPDATE Usuario SET Contraseña = ? WHERE ID_Usuario = ?', [hashedClave, id]);

const remove = (id) =>
    query('DELETE FROM Usuario WHERE ID_Usuario = ?', [id]);

/**
 * Elimina un usuario y TODOS sus registros dependientes en orden
 * seguro respecto a las foreign keys de la BD.
 *
 * Orden de borrado (hijos antes que padres):
 *   1. Mensajes       (FK → Chat, FK → Usuario)
 *   2. Chat           (FK → Usuario, FK → Servicio)
 *   3. Historial_Servicios (FK → Servicio)
 *   4. Servicio        (FK → Usuario)
 *   5. Notificaciones  (FK → Usuario destino/origen)
 *   6. Pregunta        (FK → Usuario, FK → Producto, FK tecnico)
 *   7. Comentarios     (FK → Usuario)
 *   8. Usuario
 */
const removeWithDependencies = async (id) => {
    // 1. Mensajes escritos por el usuario
    await query('DELETE FROM Mensajes WHERE ID_Usuario = ?', [id]);

    // 2. Mensajes restantes en chats del usuario (otros usuarios escribieron ahí)
    await query(
        'DELETE m FROM Mensajes m INNER JOIN Chat c ON m.Codigo_Chat = c.Codigo_Chat WHERE c.ID_Usuario = ?',
        [id]
    );

    // 3. Chats del usuario
    await query('DELETE FROM Chat WHERE ID_Usuario = ?', [id]);

    // 4. Historial de servicios del usuario
    await query(
        'DELETE h FROM Historial_Servicios h INNER JOIN Servicio s ON h.ID_Servicio = s.ID_Servicio WHERE s.ID_Usuario = ?',
        [id]
    );

    // 5. Servicios del usuario
    await query('DELETE FROM Servicio WHERE ID_Usuario = ?', [id]);

    // 6. Notificaciones (destino u origen)
    await query('DELETE FROM Notificaciones WHERE ID_Usuario_Destino = ? OR ID_Usuario_Origen = ?', [id, id]);

    // 7. Preguntas del usuario + limpiar referencia como técnico
    await query('UPDATE Pregunta SET ID_Tecnico_Responde = NULL WHERE ID_Tecnico_Responde = ?', [id]);
    await query('DELETE FROM Pregunta WHERE ID_Usuario = ?', [id]);

    // 8. Comentarios del usuario
    await query('DELETE FROM Comentarios WHERE ID_Usuario = ?', [id]);

    // 9. Finalmente, el usuario
    return query('DELETE FROM Usuario WHERE ID_Usuario = ?', [id]);
};

module.exports = { getAll, findById, findByUsername, getRol, create, update, updateMiPerfil, findByEmail, updatePassword, remove, removeWithDependencies };

