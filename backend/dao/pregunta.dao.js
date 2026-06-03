const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Pregunta');

const create = ({ ID_Usuario, Codigo_Producto, Pregunta, Fecha }) => {
    const formattedFecha = Fecha ? new Date(Fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return query(
        `INSERT INTO Pregunta (ID_Usuario, Codigo_Producto, Pregunta, Fecha) VALUES (?, ?, ?, ?)`,
        [ID_Usuario, Codigo_Producto, Pregunta, formattedFecha]
    );
};

const update = ({ ID_Usuario, Codigo_Producto, Pregunta, Fecha, ID_Consulta }) => {
    const formattedFecha = Fecha ? new Date(Fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return query(
        `UPDATE Pregunta SET ID_Usuario=?, Codigo_Producto=?, Pregunta=?, Fecha=? WHERE ID_Consulta=?`,
        [ID_Usuario, Codigo_Producto, Pregunta, formattedFecha, ID_Consulta]
    );
};

const remove = (id) =>
    query('DELETE FROM Pregunta WHERE ID_Consulta = ?', [id]);

const getByUsuario = (idUsuario) =>
    query('SELECT * FROM Pregunta WHERE ID_Usuario = ? ORDER BY ID_Consulta DESC', [idUsuario]);

module.exports = { getAll, create, update, remove, getByUsuario };
