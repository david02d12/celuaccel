const request = require('supertest');
const { app } = require('../../server');
const { queryPromise } = require('../../config/db');
const jwt = require('jsonwebtoken');

describe('Servicios Integration Tests (Database)', () => {
    const randomId = `INT_TEST_SVC_${Math.floor(Math.random() * 100000)}`;
    const testUser = {
        ID_Usuario: randomId,
        Nombre: 'Test Service User',
        Correo: `${randomId}@integration.com`,
        Clave: 'hashedclave', // Simulamos una clave hasheada directa
        Codigo_Rol: 2
    };

    let tokenValido;
    let servicioInsertadoId;

    beforeAll(async () => {
        // 1. Crear usuario directamente en DB
        await queryPromise(
            'INSERT INTO Usuario (ID_Usuario, Nombre, Correo, Contraseña, Codigo_Rol) VALUES (?, ?, ?, ?, ?)',
            [testUser.ID_Usuario, testUser.Nombre, testUser.Correo, testUser.Clave, testUser.Codigo_Rol]
        );

        // 2. Crear un servicio en la DB asignado a este usuario
        const result = await queryPromise(
            `INSERT INTO Servicio (Descripcion, Movil_Nombre, Movil_Especificacion, Fecha, Precio, Precio_Repuestos, Precio_Mano_Obra, Etapa, ID_Usuario) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Pantalla Rota Test', 'iPhone X', 'A1865', new Date(), 100, 50, 50, 1, testUser.ID_Usuario]
        );
        servicioInsertadoId = result.insertId;

        // 3. Generar token real (como lo haría el backend)
        tokenValido = jwt.sign({ id: testUser.ID_Usuario }, process.env.JWT_SECRET || 'CeluAccel_S3cr3t_K3y_2026!#Secure', { expiresIn: '1h' });
    });

    afterAll(async () => {
        // LIMPIEZA
        if (servicioInsertadoId) {
            await queryPromise('DELETE FROM Servicio WHERE ID_Servicio = ?', [servicioInsertadoId]);
        }
        await queryPromise('DELETE FROM Usuario WHERE ID_Usuario = ?', [testUser.ID_Usuario]);
    });

    it('Debe retornar 401 si no se envía un token', async () => {
        const res = await request(app)
            .get(`/api/servicios/mis-servicios/${testUser.ID_Usuario}`)
            .expect(401);
            
        expect(res.body.error).toBe('Acceso denegado. Token no proporcionado.');
    });

    it('Debe obtener la lista de servicios del usuario exitosamente usando un token válido', async () => {
        const res = await request(app)
            .get(`/api/servicios/mis-servicios/${testUser.ID_Usuario}`)
            .set('Authorization', `Bearer ${tokenValido}`)
            .expect(200);
            
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1); // Mínimo debe venir el que insertamos
        
        // Verificamos que los datos mapeen correctamente desde MySQL
        const nuestroServicio = res.body.find(s => s.ID_Servicio === servicioInsertadoId);
        expect(nuestroServicio).toBeDefined();
        expect(nuestroServicio.Descripcion).toBe('Pantalla Rota Test');
        expect(nuestroServicio.Movil_Nombre).toBe('iPhone X');
        expect(nuestroServicio.Etapa).toBe(1); // 1 = En proceso
    });
});
