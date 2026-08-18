const historialController = require('../../controllers/historialController');
const historialService = require('../../services/historial.service');

jest.mock('../../services/historial.service');

describe('Historial Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { body: {}, params: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    it('listar', async () => {
        historialService.listar.mockResolvedValue([]);
        await historialController.listarHistorial(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('agregar', async () => {
        historialService.agregar.mockResolvedValue();
        await historialController.agregarHistorial(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('actualizar', async () => {
        historialService.actualizar.mockResolvedValue();
        await historialController.actualizarHistorial(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('eliminar', async () => {
        historialService.eliminar.mockResolvedValue();
        await historialController.eliminarHistorial(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
