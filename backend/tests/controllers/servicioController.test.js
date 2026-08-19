const servicioController = require('../../controllers/servicioController');
const servicioService = require('../../services/servicio.service');

jest.mock('../../services/servicio.service');

describe('Servicio Controller', () => {
    let req, res;
    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {}, userId: 'user1' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('listar', () => {
        it('debe retornar 200 y la lista', async () => {
            servicioService.listar.mockResolvedValue([{ id: 1 }]);
            await servicioController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('debe manejar error', async () => {
            const err = new Error('Test error');
            err.status = 400;
            servicioService.listar.mockRejectedValue(err);
            await servicioController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
        });
    });

    describe('misServicios', () => {
        it('debe retornar mis servicios por params', async () => {
            req.params.idUsuario = 'u1';
            servicioService.misServicios.mockResolvedValue([{ id: 1 }]);
            await servicioController.misServicios(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });
    });

    describe('listarMios', () => {
        it('debe retornar servicios del userId', async () => {
            servicioService.misServicios.mockResolvedValue([{ id: 1 }]);
            await servicioController.listarMios(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe crear y retornar 201', async () => {
            servicioService.agregar.mockResolvedValue({ insertId: 5 });
            await servicioController.agregar(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Servicio registrado correctamente.', id: 5 });
        });
    });

    describe('actualizar', () => {
        it('debe actualizar y retornar 200', async () => {
            servicioService.actualizar.mockResolvedValue();
            await servicioController.actualizar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Servicio actualizado correctamente.' });
        });
    });

    describe('cancelar', () => {
        it('debe cancelar y retornar 200', async () => {
            req.params.id = 1;
            servicioService.cancelar.mockResolvedValue();
            await servicioController.cancelar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Servicio cancelado correctamente.' });
        });
    });

    describe('eliminar', () => {
        it('debe eliminar y retornar 200', async () => {
            req.params.id = 1;
            servicioService.eliminar.mockResolvedValue();
            await servicioController.eliminar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Servicio eliminado correctamente.' });
        });
    });
});
