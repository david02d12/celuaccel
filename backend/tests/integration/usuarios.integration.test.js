const request = require('supertest');
const { app } = require('../../server');
const { queryPromise } = require('../../config/db');
const jwt = require('jsonwebtoken');

describe('Usuarios + Roles Integration Tests (Database)', () => {
    const adminId = `INT_USR_ADM_${Math.floor(Math.random() * 100000)}`;
    const clienteId = `INT_USR_CLI_${Math.floor(Math.random() * 100000)}`;
    let adminToken, clienteToken;

    beforeAll(async () => {
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [adminId, 'Admin Users Test', `${adminId}@test.com`, 'hash', 3]
        );
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [clienteId, 'Cliente Users Test', `${clienteId}@test.com`, 'hash', 2]
        );
        const secret = process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure';
        adminToken = jwt.sign({ id: adminId }, secret, { expiresIn: '1h' });
        clienteToken = jwt.sign({ id: clienteId }, secret, { expiresIn: '1h' });
    });

    afterAll(async () => {
        await queryPromise('DELETE FROM Usuario WHERE ID_Usuario IN (?, ?)', [adminId, clienteId]);
    });

    it('Admin debe poder ver su propio perfil', async () => {
        const res = await request(app)
            .get(`/api/usuarios/perfil/${adminId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(res.body.Nombre).toBe('Admin Users Test');
    });

    it('Cliente NO debe poder ver perfil de otro usuario', async () => {
        const res = await request(app)
            .get(`/api/usuarios/perfil/${adminId}`)
            .set('Authorization', `Bearer ${clienteToken}`);

        expect(res.status).toBe(403);
    });

    it('Cliente debe poder actualizar su propio perfil', async () => {
        const res = await request(app)
            .put('/api/usuarios/mi-perfil')
            .set('Authorization', `Bearer ${clienteToken}`)
            .send({ Nombre: 'Cliente Actualizado', Correo: `${clienteId}@test.com`, Telefono: '3001234567' });

        expect(res.status).toBe(200);

        const rows = await queryPromise('SELECT Nombre, Telefono FROM Usuario WHERE ID_Usuario = ?', [clienteId]);
        expect(rows[0].Nombre).toBe('Cliente Actualizado');
        expect(rows[0].Telefono).toBe('3001234567');
    });

    it('Admin debe poder listar todos los usuarios', async () => {
        const res = await request(app)
            .get('/api/usuarios/listar')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
});
