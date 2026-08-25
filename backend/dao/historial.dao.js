const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Historial_Servicios');

const create = ({ ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado }) =>
    query(
        `INSERT INTO Historial_Servicios (ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado)
         VALUES (?, ?, ?, ?)`,
        [ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado]
    );

const update = ({ ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado, ID_Registro }) =>
    query(
        `UPDATE Historial_Servicios SET ID_Servicio=?, Fecha_Evento=?, Descripcion_Evento=?, Estado=? WHERE ID_Registro=?`,
        [ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado, ID_Registro]
    );

const remove = (id) =>
    query('DELETE FROM Historial_Servicios WHERE ID_Registro = ?', [id]);

module.exports = { getAll, create, update, remove };
