const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM pregunta');

const create = ({ ID_Usuario, Codigo_Producto, Pregunta, Fecha }) => {
    const formattedFecha = Fecha ? new Date(Fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return query(
        `INSERT INTO pregunta (ID_Usuario, Codigo_Producto, Pregunta, Fecha) VALUES (?, ?, ?, ?)`,
        [ID_Usuario, Codigo_Producto, Pregunta, formattedFecha]
    );
};

const update = ({ ID_Consulta, ID_Usuario, Codigo_Producto, Pregunta, Fecha }) =>
    query(
        `UPDATE pregunta SET ID_Usuario=?, Codigo_Producto=?, Pregunta=?, Fecha=? WHERE ID_Consulta=?`,
        [ID_Usuario, Codigo_Producto, Pregunta, Fecha, ID_Consulta]
    );

/** El técnico responde una pregunta del catálogo */
const responder = ({ ID_Consulta, Respuesta, ID_Tecnico_Responde }) =>
    query(
        `UPDATE pregunta SET Respuesta=?, ID_Tecnico_Responde=?, Fecha_Respuesta=NOW() WHERE ID_Consulta=?`,
        [Respuesta, ID_Tecnico_Responde, ID_Consulta]
    );

const remove = (id) =>
    query('DELETE FROM pregunta WHERE ID_Consulta = ?', [id]);

const getByUsuario = (idUsuario) =>
    query('SELECT * FROM pregunta WHERE ID_Usuario = ? ORDER BY ID_Consulta DESC', [idUsuario]);

module.exports = { getAll, create, update, responder, remove, getByUsuario };
