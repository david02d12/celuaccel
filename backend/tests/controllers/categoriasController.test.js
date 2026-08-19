const categoriasController = require('../../controllers/categoriaController');
const categoriaService = require('../../services/categoria.service');

jest.mock('../../services/categoria.service');

describe('Categorias Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { body: {}, params: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    it('listar', async () => {
        categoriaService.listar.mockResolvedValue([]);
        await categoriasController.listar(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('agregar', async () => {
        categoriaService.agregar.mockResolvedValue();
        await categoriasController.agregar(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('actualizar', async () => {
        categoriaService.actualizar.mockResolvedValue();
        await categoriasController.actualizar(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('eliminar', async () => {
        categoriaService.eliminar.mockResolvedValue();
        await categoriasController.eliminar(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
