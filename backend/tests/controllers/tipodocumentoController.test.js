const tipodocumentoController = require('../../controllers/tipoController');
const tipodocumentoService = require('../../services/tipodocumento.service');

jest.mock('../../services/tipodocumento.service');

describe('Tipo Documento Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { body: {}, params: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    it('listar', async () => {
        tipodocumentoService.listar.mockResolvedValue([]);
        await tipodocumentoController.listarDocumentos(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('agregar', async () => {
        tipodocumentoService.agregar.mockResolvedValue();
        await tipodocumentoController.agregarDocumento(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('actualizar', async () => {
        tipodocumentoService.actualizar.mockResolvedValue();
        await tipodocumentoController.actualizarDocumento(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('eliminar', async () => {
        tipodocumentoService.eliminar.mockResolvedValue();
        await tipodocumentoController.eliminarDocumento(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
