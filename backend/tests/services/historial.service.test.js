const historialService = require('../../services/historial.service');
const historialDao = require('../../dao/historial.dao');

jest.mock('../../dao/historial.dao');

describe('Historial Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe listar', async () => {
            historialDao.getAll.mockResolvedValue([{ id: 1 }]);
            const res = await historialService.listar();
            expect(res).toEqual([{ id: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error', async () => {
            await expect(historialService.agregar({})).rejects.toThrow('Los campos ID_Servicio y Descripcion_Evento son obligatorios.');
        });
        it('debe agregar', async () => {
            historialDao.create.mockResolvedValue({ insertId: 1 });
            await expect(historialService.agregar({ ID_Servicio: 2, Descripcion_Evento: 'Test Event' })).resolves.toBeDefined();
        });
    });

    describe('eliminar', () => {
        it('debe eliminar', async () => {
            historialDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(historialService.eliminar(1)).resolves.toBeUndefined();
        });
    });
});
