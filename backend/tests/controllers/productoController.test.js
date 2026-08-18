const productoController = require('../../controllers/productoController');
const productoService = require('../../services/producto.service');

jest.mock('../../services/producto.service');

describe('Producto Controller', () => {
    let req, res;
    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {}, userId: 'user1' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('listarPublicos', () => {
        it('debe retornar 200 y la lista', async () => {
            productoService.listarPublicos.mockResolvedValue([{ id: 1 }]);
            await productoController.listarPublicos(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('debe manejar error', async () => {
            const error = new Error('Err');
            error.status = 500;
            productoService.listarPublicos.mockRejectedValue(error);
            await productoController.listarPublicos(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Err' });
        });
    });

    describe('listar', () => {
        it('debe retornar 200 y listar todos', async () => {
            productoService.listar.mockResolvedValue([{ id: 1 }]);
            await productoController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe crear y retornar 201', async () => {
            productoService.agregar.mockResolvedValue();
            await productoController.agregar(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Producto creado correctamente.' });
        });
    });

    describe('actualizar', () => {
        it('debe actualizar y retornar 200', async () => {
            productoService.actualizar.mockResolvedValue();
            await productoController.actualizar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Producto actualizado correctamente.' });
        });
    });

    describe('eliminar', () => {
        it('debe eliminar y retornar 200', async () => {
            req.params.id = 'A';
            productoService.eliminar.mockResolvedValue();
            await productoController.eliminar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Producto eliminado correctamente.' });
        });
    });

    describe('descontarStock', () => {
        it('debe descontar y retornar lo que dice el service', async () => {
            req.params.id = 'A';
            req.body.cantidad = 2;
            productoService.descontarStock.mockResolvedValue({ message: 'Stock actualizado.' });
            await productoController.descontarStock(req, res);
            expect(productoService.descontarStock).toHaveBeenCalledWith('A', 2);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Stock actualizado.' });
        });
    });
});
