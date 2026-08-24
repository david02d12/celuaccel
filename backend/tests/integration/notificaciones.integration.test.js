const request = require('supertest');
const { app } = require('../../server');
const { queryPromise } = require('../../config/db');
const jwt = require('jsonwebtoken');

describe('Notificaciones Integration Tests (Database)', () => {
    const adminId = `INT_NOTIF_ADM_${Math.floor(Math.random() * 100000)}`;
    const clienteId = `INT_NOTIF_CLI_${Math.floor(Math.random() * 100000)}`;
    let adminToken, clienteToken;
    let notificacionId;

    beforeAll(async () => {
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [adminId, 'Admin Notif Test', `${adminId}@test.com`, 'hash', 3]
        );
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [clienteId, 'Cliente Notif Test', `${clienteId}@test.com`, 'hash', 2]
        );
        const secret = process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure';
        adminToken = jwt.sign({ id: adminId }, secret, { expiresIn: '1h' });
        clienteToken = jwt.sign({ id: clienteId }, secret, { expiresIn: '1h' });
    });

    afterAll(async () => {
        if (notificacionId) {
            await queryPromise('DELETE FROM Notificaciones WHERE ID_Notificacion = ?', [notificacionId]);
        }
        await queryPromise('DELETE FROM Notificaciones WHERE ID_Usuario_Destino = ?', [clienteId]);
        await queryPromise('DELETE FROM Usuario WHERE ID_Usuario IN (?, ?)', [adminId, clienteId]);
    });

    it('Admin debe poder enviar notificación dirigida a un cliente', async () => {
        const res = await request(app)
            .post('/api/notificaciones/dirigida')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ ID_Usuario_Destino: clienteId, Mensaje: 'Tu equipo está listo para recoger' });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Notificación enviada al cliente.');
        notificacionId = res.body.id;
    });

    it('Cliente debe ver sus notificaciones', async () => {
        const res = await request(app)
            .get('/api/notificaciones/mis-notificaciones')
            .set('Authorization', `Bearer ${clienteToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        const nuestra = res.body.find(n => n.ID_Notificacion === notificacionId);
        expect(nuestra).toBeDefined();
        expect(nuestra.Leida).toBe(0);
    });

    it('Conteo de no leídas debe incluir la notificación enviada', async () => {
        const res = await request(app)
            .get('/api/notificaciones/no-leidas/count')
            .set('Authorization', `Bearer ${clienteToken}`)
            .expect(200);

        expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('Cliente debe poder marcar su notificación como leída', async () => {
        const res = await request(app)
            .put(`/api/notificaciones/marcar-leida/${notificacionId}`)
            .set('Authorization', `Bearer ${clienteToken}`)
            .expect(200);

        expect(res.body.message).toBe('Marcada como leída.');

        const rows = await queryPromise('SELECT Leida FROM Notificaciones WHERE ID_Notificacion = ?', [notificacionId]);
        expect(rows[0].Leida).toBe(1);
    });

    it('Un cliente NO debe acceder a rutas de admin (rol check)', async () => {
        const res = await request(app)
            .post('/api/notificaciones/agregar')
            .set('Authorization', `Bearer ${clienteToken}`)
            .send({ Mensaje: 'Intento sin permiso' });

        expect(res.status).toBe(403);
    });
});
