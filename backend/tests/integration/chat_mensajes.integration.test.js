const request = require('supertest');
const { app } = require('../../server');
const { queryPromise } = require('../../config/db');
const jwt = require('jsonwebtoken');

describe('Chat + Mensajes Integration Tests (Database)', () => {
    const userId = `INT_CHAT_${Math.floor(Math.random() * 100000)}`;
    let token;
    let chatId;

    beforeAll(async () => {
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [userId, 'Chat Test User', `${userId}@test.com`, 'hash', 2]
        );
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure', { expiresIn: '1h' });
    });

    afterAll(async () => {
        if (chatId) {
            await queryPromise('DELETE FROM Mensajes WHERE Codigo_Chat = ?', [chatId]);
            await queryPromise('DELETE FROM Chat WHERE Codigo_Chat = ?', [chatId]);
        }
        await queryPromise('DELETE FROM Usuario WHERE ID_Usuario = ?', [userId]);
    });

    it('Debe crear un chat de consulta (sin servicio) en la DB real', async () => {
        const res = await request(app)
            .post('/api/chats/agregar')
            .set('Authorization', `Bearer ${token}`)
            .send({ ID_Usuario: userId });

        expect(res.status).toBe(201);
        expect(res.body.existente).toBe(false);
        chatId = res.body.id;

        const rows = await queryPromise('SELECT * FROM Chat WHERE Codigo_Chat = ?', [chatId]);
        expect(rows.length).toBe(1);
    });

    it('Debe enviar un mensaje al chat pasando el filtro de contenido', async () => {
        const res = await request(app)
            .post('/api/mensajes/agregar')
            .set('Authorization', `Bearer ${token}`)
            .send({ Codigo_Chat: chatId, ID_Usuario: userId, Mensaje: 'Hola, tengo una consulta sobre mi equipo' });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Mensaje enviado correctamente.');

        const rows = await queryPromise('SELECT * FROM Mensajes WHERE Codigo_Chat = ? ORDER BY Codigo_Mensaje DESC LIMIT 1', [chatId]);
        expect(rows.length).toBe(1);
        expect(rows[0].Mensaje).toBe('Hola, tengo una consulta sobre mi equipo');
        expect(rows[0].Estado).toBe(0); // No leído
    });

    it('Debe rechazar un mensaje con contenido inapropiado (filtrarContenido middleware)', async () => {
        const res = await request(app)
            .post('/api/mensajes/agregar')
            .set('Authorization', `Bearer ${token}`)
            .send({ Codigo_Chat: chatId, ID_Usuario: userId, Mensaje: 'Eres un idiota total' });

        expect(res.status).toBe(400);
        expect(res.body.codigo).toBe('CONTENIDO_INAPROPIADO');
    });

    it('Debe rechazar un mensaje con URL', async () => {
        const res = await request(app)
            .post('/api/mensajes/agregar')
            .set('Authorization', `Bearer ${token}`)
            .send({ Codigo_Chat: chatId, ID_Usuario: userId, Mensaje: 'Visita https://spam.com para ganar' });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('enlaces');
    });

    it('Debe listar mensajes por chat', async () => {
        const res = await request(app)
            .get(`/api/mensajes/por-chat/${chatId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('Debe listar mis chats', async () => {
        const res = await request(app)
            .get('/api/chats/listar-mios')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });
});
