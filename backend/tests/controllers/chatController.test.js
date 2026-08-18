const chatController = require('../../controllers/chatController');
const chatService = require('../../services/chat.service');

jest.mock('../../services/chat.service');

describe('Chat Controller', () => {
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
        it('debe retornar 200 y listar todos', async () => {
            chatService.listar.mockResolvedValue([{ Codigo_Chat: 1 }]);
            await chatController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ Codigo_Chat: 1 }]);
        });

        it('debe manejar error', async () => {
            const err = new Error('test');
            err.status = 500;
            chatService.listar.mockRejectedValue(err);
            await chatController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'test' });
        });
    });

    describe('listarMios', () => {
        it('debe retornar 200', async () => {
            chatService.listarMios.mockResolvedValue([{ Codigo_Chat: 1 }]);
            await chatController.listarMios(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ Codigo_Chat: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe retornar 200 si es existente', async () => {
            chatService.agregar.mockResolvedValue({ existente: true, id: 10 });
            await chatController.agregar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ existente: true, id: 10 });
        });

        it('debe retornar 201 si es nuevo', async () => {
            chatService.agregar.mockResolvedValue({ existente: false, id: 10 });
            await chatController.agregar(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ existente: false, id: 10 });
        });
    });

    describe('actualizar', () => {
        it('debe retornar 200', async () => {
            chatService.actualizar.mockResolvedValue();
            await chatController.actualizar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('eliminar', () => {
        it('debe retornar 200', async () => {
            req.params.id = 1;
            chatService.eliminar.mockResolvedValue();
            await chatController.eliminar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
