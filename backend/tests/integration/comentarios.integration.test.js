const request = require('supertest');
const { app } = require('../../server');
const { queryPromise } = require('../../config/db');
const jwt = require('jsonwebtoken');

describe('Comentarios Integration Tests (Database)', () => {
    const clienteId = `INT_COM_CLI_${Math.floor(Math.random() * 100000)}`;
    let token;
    let comentarioId;
    let servicioId;

    beforeAll(async () => {
        // Crear cliente
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [clienteId, 'Cliente Coment Test', `${clienteId}@test.com`, 'hash', 2]
        );
        // Crear servicio activo para que el cliente pueda comentar
        const svcResult = await queryPromise(
            `INSERT INTO Servicio (Descripcion, Movil_Nombre, Movil_Especificacion, Fecha, Precio, Etapa, ID_Usuario) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['Servicio para comentario', 'Samsung S21', 'SM-G991', new Date(), 80000, 2, clienteId]
        );
        servicioId = svcResult.insertId;

        token = jwt.sign({ id: clienteId }, process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure', { expiresIn: '1h' });
    });

    afterAll(async () => {
        if (comentarioId) {
            await queryPromise('DELETE FROM Comentarios WHERE Codigo_Comentario = ?', [comentarioId]);
        }
        if (servicioId) {
            await queryPromise('DELETE FROM Servicio WHERE ID_Servicio = ?', [servicioId]);
        }
        await queryPromise('DELETE FROM Usuario WHERE ID_Usuario = ?', [clienteId]);
    });

    it('Debe publicar un comentario con estrellas (cliente con servicio activo)', async () => {
        const res = await request(app)
            .post('/api/comentarios/agregar')
            .set('Authorization', `Bearer ${token}`)
            .send({ ID_Usuario: clienteId, Comentario: 'Excelente servicio, muy rápido y profesional', Estrellas: 5 });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Comentario publicado correctamente.');
        comentarioId = res.body.id;

        const rows = await queryPromise('SELECT * FROM Comentarios WHERE Codigo_Comentario = ?', [comentarioId]);
        expect(rows.length).toBe(1);
        expect(Number(rows[0].Estrellas)).toBe(5);
    });

    it('Debe rechazar comentario con lenguaje inapropiado (filtrarContenido middleware)', async () => {
        const res = await request(app)
            .post('/api/comentarios/agregar')
            .set('Authorization', `Bearer ${token}`)
            .send({ ID_Usuario: clienteId, Comentario: 'Este servicio es una mierda total', Estrellas: 1 });

        expect(res.status).toBe(400);
        expect(res.body.codigo).toBe('CONTENIDO_INAPROPIADO');
    });

    it('Debe obtener el promedio de estrellas (ruta pública)', async () => {
        const res = await request(app)
            .get('/api/comentarios/promedio')
            .expect(200);

        expect(res.body).toHaveProperty('promedio');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('distribucion');
    });
});
