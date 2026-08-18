const mensajesController = require('../../controllers/mensajeController');
const mensajeService = require('../../services/mensaje.service');

jest.mock('../../services/mensaje.service');

describe('Mensajes Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { body: {}, params: {}, userId: 'u1' };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    it('listarPorChat', async () => {
        mensajeService.listarPorChat.mockResolvedValue([]);
        req.params.idChat = 1;
        await mensajesController.listarPorChat(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('agregar', async () => {
        mensajeService.agregar.mockResolvedValue();
        await mensajesController.agregar(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('actualizar', async () => {
        mensajeService.actualizar.mockResolvedValue();
        await mensajesController.actualizar(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('eliminar', async () => {
        mensajeService.eliminar.mockResolvedValue();
        await mensajesController.eliminar(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
