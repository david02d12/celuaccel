const rolesController = require('../../controllers/rolesController');
const rolesService = require('../../services/roles.service');

jest.mock('../../services/roles.service');

describe('Roles Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { body: {}, params: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    it('listar', async () => {
        rolesService.listar.mockResolvedValue([]);
        await rolesController.listarRoles(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('agregar', async () => {
        rolesService.crear = jest.fn().mockResolvedValue();
        await rolesController.agregarRol(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('actualizar', async () => {
        rolesService.actualizar.mockResolvedValue();
        await rolesController.actualizarRol(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('eliminar', async () => {
        rolesService.eliminar.mockResolvedValue();
        await rolesController.eliminarRol(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
