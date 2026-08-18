const preguntaController = require('../../controllers/preguntaController');
const preguntaService = require('../../services/pregunta.service');

jest.mock('../../services/pregunta.service');

describe('Pregunta Controller', () => {
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
            preguntaService.listar.mockResolvedValue([{ ID_Consulta: 1 }]);
            await preguntaController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ ID_Consulta: 1 }]);
        });

        it('debe manejar error', async () => {
            preguntaService.listar.mockRejectedValue(new Error('err'));
            await preguntaController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('listarMias', () => {
        it('debe retornar 200', async () => {
            preguntaService.listarMias.mockResolvedValue([{ ID_Consulta: 1 }]);
            await preguntaController.listarMias(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('agregar', () => {
        it('debe retornar 201', async () => {
            preguntaService.agregar.mockResolvedValue();
            await preguntaController.agregar(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('actualizar', () => {
        it('debe retornar 200', async () => {
            preguntaService.actualizar.mockResolvedValue();
            await preguntaController.actualizar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('eliminar', () => {
        it('debe retornar 200', async () => {
            req.params.id = 1;
            preguntaService.eliminar.mockResolvedValue();
            await preguntaController.eliminar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('responder', () => {
        it('debe retornar 200', async () => {
            req.params.id = 1;
            req.body.Respuesta = 'R';
            preguntaService.responder.mockResolvedValue();
            await preguntaController.responder(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
