const authController = require('../../controllers/authController');
const authService = require('../../services/auth.service');
const usuarioService = require('../../services/usuario.service');
const passwordResetService = require('../../services/passwordReset.service');

jest.mock('../../services/auth.service');
jest.mock('../../services/usuario.service');
jest.mock('../../services/passwordReset.service');

describe('Auth Controller (Usuarios)', () => {
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
        it('debe retornar 200 y usuarios', async () => {
            usuarioService.listar.mockResolvedValue([{ id: 1 }]);
            await authController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });
        
        it('debe manejar error', async () => {
            usuarioService.listar.mockRejectedValue(new Error('err'));
            await authController.listar(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'err' });
        });
    });

    describe('actualizar', () => {
        it('debe retornar 200', async () => {
            usuarioService.actualizar.mockResolvedValue();
            await authController.actualizar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario actualizado correctamente.' });
        });
    });

    describe('eliminar', () => {
        it('debe retornar 200', async () => {
            req.params.id = 'A';
            usuarioService.eliminar.mockResolvedValue();
            await authController.eliminar(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario eliminado correctamente.' });
        });
    });

    describe('perfilPublico', () => {
        it('debe retornar 200 y perfil', async () => {
            req.params.id = 'A';
            usuarioService.perfilPublico.mockResolvedValue({ id: 'A' });
            await authController.perfilPublico(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 'A' });
        });
    });

    describe('actualizarMiPerfil', () => {
        it('debe retornar 200', async () => {
            usuarioService.actualizarMiPerfil.mockResolvedValue();
            await authController.actualizarMiPerfil(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Perfil actualizado correctamente.' });
        });
    });

    describe('forgotPassword', () => {
        it('debe retornar 200', async () => {
            passwordResetService.forgotPassword.mockResolvedValue();
            await authController.forgotPassword(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Correo enviado para recuperar contraseña.' });
        });
    });

    describe('resetPassword', () => {
        it('debe retornar 200', async () => {
            passwordResetService.resetPassword.mockResolvedValue();
            await authController.resetPassword(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Contraseña actualizada correctamente.' });
        });
    });
});
