const request = require('supertest');
const { app } = require('../../server');
const { queryPromise } = require('../../config/db');
const jwt = require('jsonwebtoken');

describe('Categorías Integration Tests (Database)', () => {
    const catId = Math.floor(Math.random() * 100000);
    const adminId = `INT_CAT_ADM_${Math.floor(Math.random() * 100000)}`;
    let adminToken;

    beforeAll(async () => {
        await queryPromise('DELETE FROM Categoria WHERE ID_Categoria = ?', [catId]);
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [adminId, 'Admin Cat Test', `${adminId}@test.com`, 'hash', 3]
        );
        adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure', { expiresIn: '1h' });
    });

    afterAll(async () => {
        await queryPromise('DELETE FROM Categoria WHERE ID_Categoria = ?', [catId]);
        await queryPromise('DELETE FROM Usuario WHERE ID_Usuario = ?', [adminId]);
    });

    it('Debe listar categorías sin autenticación (ruta pública)', async () => {
        const res = await request(app)
            .get('/api/categorias/publico')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });

    it('Debe crear una categoría en la DB real', async () => {
        const res = await request(app)
            .post('/api/categorias/agregar')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ ID_Categoria: catId, Nombre_Categoria: 'Categoría Test Integration' });

        expect(res.status).toBe(201);

        const rows = await queryPromise('SELECT * FROM Categoria WHERE ID_Categoria = ?', [catId]);
        expect(rows.length).toBe(1);
        expect(rows[0].Nombre_Categoria).toBe('Categoría Test Integration');
    });

    it('No debe crear categoría duplicada', async () => {
        const res = await request(app)
            .post('/api/categorias/agregar')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ ID_Categoria: catId, Nombre_Categoria: 'Duplicada' });

        expect(res.status).toBe(409);
    });

    it('Debe actualizar la categoría', async () => {
        const res = await request(app)
            .put('/api/categorias/actualizar')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ ID_Categoria: catId, Nombre_Categoria: 'Categoría Actualizada' });

        expect(res.status).toBe(200);

        const rows = await queryPromise('SELECT Nombre_Categoria FROM Categoria WHERE ID_Categoria = ?', [catId]);
        expect(rows[0].Nombre_Categoria).toBe('Categoría Actualizada');
    });

    it('Debe eliminar la categoría', async () => {
        const res = await request(app)
            .delete(`/api/categorias/eliminar/${catId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        const rows = await queryPromise('SELECT * FROM Categoria WHERE ID_Categoria = ?', [catId]);
        expect(rows.length).toBe(0);
    });
});
