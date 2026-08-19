const rolesService = require('../../services/roles.service');
const rolesDao = require('../../dao/roles.dao');

jest.mock('../../dao/roles.dao');

describe('Roles Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe retornar', async () => {
            rolesDao.getAll.mockResolvedValue([{ id: 1 }]);
            const res = await rolesService.listar();
            expect(res).toEqual([{ id: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error', async () => {
            await expect(rolesService.crear(null, null)).rejects.toThrow('Los campos Codigo_Rol y Nombre_Rol son obligatorios.');
        });
        it('debe agregar', async () => {
            rolesDao.create.mockResolvedValue({ insertId: 1 });
            await expect(rolesService.crear(1, 'admin')).resolves.toBeUndefined();
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error', async () => {
            await expect(rolesService.actualizar(null, null)).rejects.toThrow('Los campos Codigo_Rol y Nombre_Rol son obligatorios.');
        });
        it('debe actualizar', async () => {
            rolesDao.findById = jest.fn().mockResolvedValue([{ id: 1 }]);
            rolesDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(rolesService.actualizar(1, 'admin')).resolves.toBeUndefined();
        });
    });

    describe('eliminar', () => {
        it('debe eliminar', async () => {
            rolesDao.findById = jest.fn().mockResolvedValue([{ id: 1 }]);
            rolesDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(rolesService.eliminar(1)).resolves.toBeUndefined();
        });
    });
});
