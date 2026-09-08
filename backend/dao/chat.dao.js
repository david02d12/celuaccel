const { queryPromise: query } = require('../config/db');

// Query base — usa derived tables en FROM (compatible con TiDB Cloud)
// TiDB Cloud NO soporta subqueries dentro de cláusulas ON
const CHAT_SELECT = `
    SELECT
        c.Codigo_Chat,
        c.ID_Usuario,
        c.ID_Servicio,
        s.Etapa             AS Etapa_Servicio,
        c.Estado_Chat,
        u.Nombre            AS Nombre_Usuario,
        m.Mensaje           AS Ultimo_Mensaje,
        m.Fecha_Mensaje     AS Fecha_Ultimo_Mensaje,
        utec.Nombre         AS Nombre_Tecnico
    FROM chat c
    LEFT JOIN usuario u   ON u.ID_Usuario = c.ID_Usuario
    LEFT JOIN servicio s  ON s.ID_Servicio = c.ID_Servicio
    LEFT JOIN (
        SELECT Codigo_Chat, MAX(Codigo_Mensaje) AS last_msg_id
        FROM mensajes
        GROUP BY Codigo_Chat
    ) lm ON lm.Codigo_Chat = c.Codigo_Chat
    LEFT JOIN mensajes m  ON m.Codigo_Mensaje = lm.last_msg_id
    LEFT JOIN (
        SELECT m2.Codigo_Chat, MIN(m2.Codigo_Mensaje) AS first_tec_id
        FROM mensajes m2
        JOIN usuario u3 ON u3.ID_Usuario = m2.ID_Usuario
        WHERE u3.Codigo_Rol IN (1, 3)
        GROUP BY m2.Codigo_Chat
    ) ft ON ft.Codigo_Chat = c.Codigo_Chat
    LEFT JOIN mensajes mtec ON mtec.Codigo_Mensaje = ft.first_tec_id
    LEFT JOIN usuario utec ON utec.ID_Usuario = mtec.ID_Usuario
`;

const getAll = (rol) => {
    const whereClause = rol === 3 ? '' : " WHERE c.Estado_Chat = 'Activo'";
    return query(`${CHAT_SELECT} ${whereClause} ORDER BY c.Codigo_Chat DESC`);
};

const getMios = (idUsuario) =>
    query(
        `${CHAT_SELECT}
         WHERE TRIM(c.ID_Usuario) = TRIM(?)
            OR c.ID_Servicio IN (
                SELECT ID_Servicio FROM servicio WHERE TRIM(ID_Usuario) = TRIM(?)
            )
         ORDER BY c.Codigo_Chat DESC`,
        [idUsuario, idUsuario]
    );

const findByServicio = (ID_Servicio) => {
    if (ID_Servicio === null || ID_Servicio === undefined) return Promise.resolve([]);
    return query('SELECT Codigo_Chat FROM chat WHERE ID_Servicio = ?', [ID_Servicio]);
};

const create = (ID_Usuario, ID_Servicio) => {
    if (ID_Servicio !== null && ID_Servicio !== undefined) {
        // Inserción atómica: solo inserta si no existe ya un chat para este servicio
        // Esto previene duplicados por condiciones de carrera
        return query(
            `INSERT INTO chat (ID_Usuario, ID_Servicio, Estado_Chat)
             SELECT ?, ?, 'Activo'
             FROM DUAL
             WHERE NOT EXISTS (SELECT 1 FROM chat WHERE ID_Servicio = ?)`,
            [ID_Usuario, ID_Servicio, ID_Servicio]
        );
    }
    // Chat de consulta de catálogo: sin servicio asociado
    return query("INSERT INTO chat (ID_Usuario, Estado_Chat) VALUES (?, 'Activo')", [ID_Usuario]);
};

const update = ({ ID_Usuario, ID_Servicio, Codigo_Chat }) =>
    query(
        'UPDATE chat SET ID_Usuario = ?, ID_Servicio = ? WHERE Codigo_Chat = ?',
        [ID_Usuario, ID_Servicio, Codigo_Chat]
    );

const remove = (id) =>
    query("UPDATE chat SET Estado_Chat = 'Oculto' WHERE Codigo_Chat = ?", [id]);

const restore = (id) =>
    query("UPDATE chat SET Estado_Chat = 'Activo' WHERE Codigo_Chat = ?", [id]);

module.exports = { getAll, getMios, findByServicio, create, update, remove, restore };
