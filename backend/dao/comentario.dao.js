const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Comentarios');

/** Promedio de estrellas, total de reseñas y distribución por puntuación */
const getPromedio = () =>
    query(`
        SELECT
            ROUND(AVG(Estrellas), 1)          AS promedio,
            COUNT(*)                           AS total,
            SUM(Estrellas = 5)                 AS cinco,
            SUM(Estrellas = 4)                 AS cuatro,
            SUM(Estrellas = 3)                 AS tres,
            SUM(Estrellas = 2)                 AS dos,
            SUM(Estrellas = 1)                 AS uno
        FROM Comentarios
    `);

/** Obtiene el dueño de un comentario para verificar propiedad */
const findById = (id) =>
    query('SELECT ID_Usuario FROM Comentarios WHERE Codigo_Comentario = ?', [id]);

const create = ({ ID_Usuario, Comentario, Fecha_Comentario, Estrellas = 5 }) =>
    query(
        `INSERT INTO Comentarios (ID_Usuario, Comentario, Fecha_Comentario, Estrellas) VALUES (?, ?, ?, ?)`,
        [ID_Usuario, Comentario, Fecha_Comentario, Estrellas]
    );

const update = ({ Comentario, Fecha_Comentario, Estrellas = 5, Codigo_Comentario }) =>
    query(
        `UPDATE Comentarios SET Comentario = ?, Fecha_Comentario = ?, Estrellas = ? WHERE Codigo_Comentario = ?`,
        [Comentario, Fecha_Comentario, Estrellas, Codigo_Comentario]
    );

const remove = (id) =>
    query('DELETE FROM Comentarios WHERE Codigo_Comentario = ?', [id]);

module.exports = { getAll, getPromedio, findById, create, update, remove };
