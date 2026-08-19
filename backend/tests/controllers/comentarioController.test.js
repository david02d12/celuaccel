const comentarioController = require('../../controllers/comentarioController');
const comentarioService = require('../../services/comentario.service');

jest.mock('../../services/comentario.service');

describe('Comentario Controller', () => {
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
        it('debe retornar 200', async () => {
            comentarioService.listar.mockResolvedValue([{ id: 1 }]);
            await comentarioController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('promedio', () => {
        it('debe retornar 200', async () => {
            comentarioService.promedio.mockResolvedValue({ promedio: 5 });
            await comentarioController.promedio(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('agregar', () => {
        it('debe retornar 201', async () => {
            comentarioService.agregar.mockResolvedValue({ message: 'ok' });
            await comentarioController.agregar(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('actualizar', () => {
        it('debe retornar 200', async () => {
            comentarioService.actualizar.mockResolvedValue();
            await comentarioController.actualizar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('eliminar', () => {
        it('debe retornar 200', async () => {
            req.params.id = 1;
            comentarioService.eliminar.mockResolvedValue();
            await comentarioController.eliminar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
