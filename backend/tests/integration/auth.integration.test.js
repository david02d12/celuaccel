const request = require('supertest');
const { app } = require('../../server');
const { queryPromise } = require('../../config/db');

describe('Auth Integration Tests (Database)', () => {
    // Generamos un ID y correo aleatorio para evitar colisiones en la DB real
    const randomId = `INT_TEST_${Math.floor(Math.random() * 100000)}`;
    const testUser = {
        ID_Usuario: randomId,
        Codigo_Documento: 1,
        Nombre: 'Test Integration User',
        Correo: `${randomId}@integration.com`,
        Clave: 'clave123',
        Codigo_Rol: 2
    };

    afterAll(async () => {
        // LIMPIEZA: Borramos el usuario de prueba de la base de datos real
        await queryPromise('DELETE FROM Usuario WHERE ID_Usuario = ?', [testUser.ID_Usuario]);
    });

    it('Debe registrar un nuevo usuario en la base de datos real', async () => {
        const res = await request(app)
            .post('/api/registro')
            .send(testUser);
        if (res.status !== 201) console.log('ERROR 500 BODY:', res.body);
        expect(res.status).toBe(201);
            
        expect(res.body.message).toBe('Usuario creado exitosamente.');
        
        // Verificamos directamente en la base de datos que el usuario exista
        const rows = await queryPromise('SELECT * FROM Usuario WHERE ID_Usuario = ?', [testUser.ID_Usuario]);
        expect(rows.length).toBe(1);
        expect(rows[0].Nombre).toBe(testUser.Nombre);
    });

    it('No debe permitir registrar un usuario que ya existe', async () => {
        const res = await request(app)
            .post('/api/registro')
            .send(testUser)
            .expect(409);
            
        expect(res.body.error).toBe('El usuario ya existe en el sistema.');
    });

    it('Debe permitir iniciar sesión con el usuario recién creado y retornar un token real', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ user: testUser.Correo, password: testUser.Clave })
            .expect(200);
            
        expect(res.body.auth).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBe(testUser.ID_Usuario);
        expect(res.body.nombre).toBe(testUser.Nombre);
    });
});
