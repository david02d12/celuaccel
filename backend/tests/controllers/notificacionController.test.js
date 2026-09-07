const notificacionController = require('../../controllers/notificacionController');
const notificacionService = require('../../services/notificacion.service');

jest.mock('../../services/notificacion.service');

describe('Notificacion Controller', () => {
    let req, res;
    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {}, query: {}, userId: 'user1' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('misNotificaciones', () => {
        it('debe retornar 200', async () => {
            notificacionService.misNotificaciones.mockResolvedValue([{ id: 1 }]);
            await notificacionController.misNotificaciones(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('contarNoLeidas', () => {
        it('debe retornar 200', async () => {
            notificacionService.contarNoLeidas.mockResolvedValue({ count: 5 });
            await notificacionController.contarNoLeidas(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('marcarLeida', () => {
        it('debe retornar 200', async () => {
            req.params.id = 1;
            notificacionService.marcarLeida.mockResolvedValue();
            await notificacionController.marcarLeida(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('marcarTodasLeidas', () => {
        it('debe retornar 200', async () => {
            notificacionService.marcarTodasLeidas.mockResolvedValue();
            await notificacionController.marcarTodasLeidas(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
