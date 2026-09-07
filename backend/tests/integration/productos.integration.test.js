const request = require('supertest');
const { app } = require('../../server');
const { queryPromise } = require('../../config/db');
const jwt = require('jsonwebtoken');

describe('Productos Integration Tests (Database)', () => {
    const randomCode = `INT_PROD_${Math.floor(Math.random() * 100000)}`;
    const adminId = `INT_ADM_PROD_${Math.floor(Math.random() * 100000)}`;
    let token;

    beforeAll(async () => {
        // Crear usuario admin directamente en DB
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [adminId, 'Admin Prod Test', `${adminId}@test.com`, 'hash', 3]
        );
        token = jwt.sign({ id: adminId }, process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure', { expiresIn: '1h' });
    });

    afterAll(async () => {
        await queryPromise('DELETE FROM Producto WHERE Codigo_Producto = ?', [randomCode]);
        await queryPromise('DELETE FROM Usuario WHERE ID_Usuario = ?', [adminId]);
    });

    it('Debe crear un producto en la base de datos real', async () => {
        const res = await request(app)
            .post('/api/productos/agregar')
            .set('Authorization', `Bearer ${token}`)
            .send({ Codigo_Producto: randomCode, Nombre: 'Pantalla Test', Precio: 50000, Cantidad: 10, Activo_Catalogo: 1, ID_Categoria: 1, Descripcion: 'Test', Imagen: 'img.png' });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Producto creado correctamente.');

        const rows = await queryPromise('SELECT * FROM Producto WHERE Codigo_Producto = ?', [randomCode]);
        expect(rows.length).toBe(1);
        expect(rows[0].Nombre).toBe('Pantalla Test');
        expect(Number(rows[0].Cantidad)).toBe(10);
    });

    it('No debe permitir crear un producto duplicado', async () => {
        const res = await request(app)
            .post('/api/productos/agregar')
            .set('Authorization', `Bearer ${token}`)
            .send({ Codigo_Producto: randomCode, Nombre: 'Duplicado', Precio: 100, Cantidad: 5, ID_Categoria: 1, Descripcion: 'Test', Imagen: 'img.png', Activo_Catalogo: 1 });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('El producto ya existe.');
    });

    it('Debe listar productos públicos activos (ruta pública)', async () => {
        const res = await request(app)
            .get('/api/productos/publico')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        const nuestro = res.body.find(p => p.Codigo_Producto === randomCode);
        expect(nuestro).toBeDefined();
    });

    it('Debe descontar stock correctamente (PATCH /productos/descontar/:id)', async () => {
        const res = await request(app)
            .patch(`/api/productos/descontar/${randomCode}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ cantidad: 3 });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('Stock actualizado');

        const rows = await queryPromise('SELECT Cantidad FROM Producto WHERE Codigo_Producto = ?', [randomCode]);
        expect(Number(rows[0].Cantidad)).toBe(7);
    });

    it('No debe descontar más stock del disponible', async () => {
        const res = await request(app)
            .patch(`/api/productos/descontar/${randomCode}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ cantidad: 999 });

        expect(res.status).toBe(409);
        expect(res.body.error).toContain('Stock insuficiente');
    });
});
