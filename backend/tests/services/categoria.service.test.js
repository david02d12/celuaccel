const categoriaService = require('../../services/categoria.service');
const categoriaDao = require('../../dao/categoria.dao');

jest.mock('../../dao/categoria.dao');

describe('Categoria Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe retornar', async () => {
            categoriaDao.getAll.mockResolvedValue([{ id: 1 }]);
            const res = await categoriaService.listar();
            expect(res).toEqual([{ id: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error', async () => {
            await expect(categoriaService.agregar({})).rejects.toThrow('Los campos ID_Categoria y Nombre_Categoria son obligatorios.');
        });
        it('debe agregar', async () => {
            categoriaDao.create.mockResolvedValue({ insertId: 1 });
            await expect(categoriaService.agregar({ ID_Categoria: 1, Nombre_Categoria: 'Cat' })).resolves.toBeUndefined();
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error', async () => {
            await expect(categoriaService.actualizar({})).rejects.toThrow('Los campos ID_Categoria y Nombre_Categoria son obligatorios.');
        });
        it('debe actualizar', async () => {
            categoriaDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(categoriaService.actualizar({ ID_Categoria: 1, Nombre_Categoria: 'Cat' })).resolves.toBeUndefined();
        });
    });

    describe('eliminar', () => {
        it('debe eliminar', async () => {
            categoriaDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(categoriaService.eliminar(1)).resolves.toBeUndefined();
        });
    });
});
