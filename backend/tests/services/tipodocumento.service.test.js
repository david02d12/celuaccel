const tipodocumentoService = require('../../services/tipodocumento.service');
const tipodocumentoDao = require('../../dao/tipodocumento.dao');

jest.mock('../../dao/tipodocumento.dao');

describe('Tipo Documento Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe retornar', async () => {
            tipodocumentoDao.getAll.mockResolvedValue([{ id: 1 }]);
            const res = await tipodocumentoService.listar();
            expect(res).toEqual([{ id: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error', async () => {
            await expect(tipodocumentoService.agregar({})).rejects.toThrow('Los campos Codigo_Documento y Tipo_Documento son obligatorios.');
        });
        it('debe agregar', async () => {
            tipodocumentoDao.create.mockResolvedValue({ insertId: 1 });
            await expect(tipodocumentoService.agregar({ Codigo_Documento: 1, Tipo_Documento: 'CC' })).resolves.toBeUndefined();
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error', async () => {
            await expect(tipodocumentoService.actualizar({})).rejects.toThrow('Los campos Codigo_Documento y Tipo_Documento son obligatorios.');
        });
        it('debe actualizar', async () => {
            tipodocumentoDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(tipodocumentoService.actualizar({ Codigo_Documento: 1, Tipo_Documento: 'CC' })).resolves.toBeUndefined();
        });
    });

    describe('eliminar', () => {
        it('debe eliminar', async () => {
            tipodocumentoDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(tipodocumentoService.eliminar(1)).resolves.toBeUndefined();
        });
    });
});
