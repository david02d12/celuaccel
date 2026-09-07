const servicioDao = require('../../dao/servicio.dao');
const db = require('../../config/db');

jest.mock('../../config/db', () => ({
    queryPromise: jest.fn()
}));

describe('Servicio DAO', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getAll debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await servicioDao.getAll();
        expect(res).toEqual([{ id: 1 }]);
    });

    it('findById debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await servicioDao.findById(1);
        expect(res).toEqual([{ id: 1 }]);
    });

    it('getByUsuario debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await servicioDao.getByUsuario('u');
        expect(res).toEqual([{ id: 1 }]);
    });

    it('getActivosByUsuario debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await servicioDao.getActivosByUsuario('u');
        expect(res).toEqual([{ id: 1 }]);
    });

    it('create debe crear', async () => {
        db.queryPromise.mockResolvedValue({ insertId: 1 });
        const res = await servicioDao.create({ ID_Usuario: 'u', Tipo_Aparato: 't', Marca: 'm', Modelo: 'm', Descripcion_Problema: 'd', Estado_Servicio: 'e', Precio_Estimado: 1, Tecnico_Asignado: 't', Fecha_Ingreso: 'f', Fecha_Estimada_Entrega: 'f' });
        expect(res.insertId).toBe(1);
    });

    it('update debe actualizar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await servicioDao.update({ Tipo_Aparato: 't', Marca: 'm', Modelo: 'm', Descripcion_Problema: 'd', Estado_Servicio: 'e', Precio_Estimado: 1, Tecnico_Asignado: 't', Fecha_Estimada_Entrega: 'f', ID_Servicio: 1 });
        expect(res.affectedRows).toBe(1);
    });



    it('remove debe eliminar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await servicioDao.remove(1);
        expect(res.affectedRows).toBe(1);
    });
});
