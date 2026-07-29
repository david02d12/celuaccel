const { queryPromise: query } = require('../config/db');

/** RF-022: Obtiene todas las garantías (admin/técnico) */
const getAll = () =>
    query(`
        SELECT g.*, s.Descripcion AS Descripcion_Servicio, u.Nombre AS Nombre_Cliente
        FROM Garantia g
        JOIN Servicio s ON s.ID_Servicio = g.ID_Servicio
        LEFT JOIN Usuario u ON u.ID_Usuario = s.ID_Usuario
        ORDER BY g.Fecha_Inicio DESC
    `);

/** RF-022: Obtiene las garantías de un servicio específico */
const getByServicio = (idServicio) =>
    query('SELECT * FROM Garantia WHERE ID_Servicio = ?', [idServicio]);

/** RF-022: Obtiene las garantías de los servicios de un cliente */
const getByUsuario = (idUsuario) =>
    query(`
        SELECT g.*
        FROM Garantia g
        JOIN Servicio s ON s.ID_Servicio = g.ID_Servicio
        WHERE s.ID_Usuario = ?
        ORDER BY g.Fecha_Inicio DESC
    `, [idUsuario]);

/** RF-022: Verifica si una garantía está vigente */
const findById = (id) =>
    query('SELECT * FROM Garantia WHERE ID_Garantia = ?', [id]);

/** RF-022: Crea una nueva garantía al completar el servicio */
const create = ({ ID_Servicio, Fecha_Inicio, Fecha_Fin, Descripcion_Garantia }) =>
    query(
        `INSERT INTO Garantia (ID_Servicio, Fecha_Inicio, Fecha_Fin, Descripcion_Garantia)
         VALUES (?, ?, ?, ?)`,
        [ID_Servicio, Fecha_Inicio, Fecha_Fin, Descripcion_Garantia]
    );

const update = ({ ID_Garantia, Fecha_Inicio, Fecha_Fin, Descripcion_Garantia }) =>
    query(
        `UPDATE Garantia SET Fecha_Inicio=?, Fecha_Fin=?, Descripcion_Garantia=?
         WHERE ID_Garantia=?`,
        [Fecha_Inicio, Fecha_Fin, Descripcion_Garantia, ID_Garantia]
    );

const remove = (id) =>
    query('DELETE FROM Garantia WHERE ID_Garantia = ?', [id]);

module.exports = { getAll, getByServicio, getByUsuario, findById, create, update, remove };
