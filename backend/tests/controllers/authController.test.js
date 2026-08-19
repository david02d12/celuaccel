const authController = require('../../controllers/authController');
const authService = require('../../services/auth.service');
const usuarioService = require('../../services/usuario.service');

jest.mock('../../services/auth.service');
jest.mock('../../services/usuario.service');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {}, userId: 'user123' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('registro', () => {
        it('debe responder 201 en caso de exito', async () => {
            authService.registro.mockResolvedValue();
            req.body = { user: 'test' };

            await authController.registro(req, res);

            expect(authService.registro).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario creado exitosamente.' });
        });

        it('debe responder con el status del error si el servicio falla', async () => {
            const error = new Error('Datos inválidos');
            error.status = 400;
            authService.registro.mockRejectedValue(error);

            await authController.registro(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Datos inválidos' });
        });
    });

    describe('login', () => {
        it('debe responder 200 y devolver el resultado del servicio', async () => {
            const mockResponse = { auth: true, token: 'abc', user: '123' };
            authService.login.mockResolvedValue(mockResponse);
            req.body = { user: 'u', password: 'p' };

            await authController.login(req, res);

            expect(authService.login).toHaveBeenCalledWith('u', 'p');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });

        it('debe responder con error 401 si falla el login', async () => {
            const error = new Error('Credenciales incorrectas.');
            error.status = 401;
            authService.login.mockRejectedValue(error);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ auth: false, message: 'Credenciales incorrectas.' });
        });
    });

    describe('changePassword', () => {
        it('debe responder 200 en caso de exito', async () => {
            authService.changePassword.mockResolvedValue();
            req.body = { oldPassword: 'old', newPassword: 'new' };

            await authController.changePassword(req, res);

            expect(authService.changePassword).toHaveBeenCalledWith('user123', 'old', 'new');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Contraseña cambiada correctamente.' });
        });
    });
});
