const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Historial_Servicios');

const create = ({ ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado }) =>
    query(
        `INSERT INTO Historial_Servicios (ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado)
         VALUES (?, ?, ?, ?)`,
        [ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado]
    );

const update = ({ ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado, ID_Historial }) =>
    query(
        `UPDATE Historial_Servicios SET ID_Servicio=?, Fecha_Evento=?, Descripcion_Evento=?, Estado=? WHERE ID_Historial=?`,
        [ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado, ID_Historial]
    );

const remove = (id) =>
    query('DELETE FROM Historial_Servicios WHERE ID_Historial = ?', [id]);

module.exports = { getAll, create, update, remove };
