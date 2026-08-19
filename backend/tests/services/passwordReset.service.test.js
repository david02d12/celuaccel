const passwordResetService = require('../../services/passwordReset.service');
const usuarioDao = require('../../dao/usuario.dao');
const sendEmail = require('../../services/email.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

jest.mock('../../dao/usuario.dao');
jest.mock('../../services/email.service');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Password Reset Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('forgotPassword', () => {
        it('debe lanzar error si no hay email', async () => {
            await expect(passwordResetService.forgotPassword('')).rejects.toThrow('El correo electrónico es obligatorio.');
        });

        it('debe lanzar error si no existe usuario', async () => {
            usuarioDao.findByEmail.mockResolvedValue([]);
            await expect(passwordResetService.forgotPassword('a@a.com')).rejects.toThrow('No existe ningún usuario registrado con ese correo electrónico.');
        });

        it('debe generar token y enviar correo', async () => {
            usuarioDao.findByEmail.mockResolvedValue([{ ID_Usuario: '1', Correo: 'a@a.com', Nombre: 'A', Contraseña: 'hash' }]);
            jwt.sign.mockReturnValue('mockToken');
            
            await passwordResetService.forgotPassword('a@a.com');
            
            expect(jwt.sign).toHaveBeenCalled();
            expect(sendEmail).toHaveBeenCalledWith('a@a.com', expect.any(String), expect.stringContaining('mockToken'));
        });
    });

    describe('resetPassword', () => {
        it('debe lanzar error si falta token o clave', async () => {
            await expect(passwordResetService.resetPassword('', 'new')).rejects.toThrow('El token y la nueva contraseña son obligatorios.');
        });

        it('debe lanzar error si formato de token es invalido', async () => {
            jwt.decode.mockReturnValue(null);
            await expect(passwordResetService.resetPassword('t', 'newPass123')).rejects.toThrow('Token con formato inválido.');
        });

        it('debe lanzar error si el usuario del token no existe', async () => {
            jwt.decode.mockReturnValue({ email: 'a@a.com' });
            usuarioDao.findByEmail.mockResolvedValue([]);
            await expect(passwordResetService.resetPassword('t', 'newPass123')).rejects.toThrow('Usuario no encontrado.');
        });

        it('debe lanzar error si la firma no coincide (token expirado o usado)', async () => {
            jwt.decode.mockReturnValue({ email: 'a@a.com' });
            usuarioDao.findByEmail.mockResolvedValue([{ Contraseña: 'hash' }]);
            jwt.verify.mockImplementation(() => { throw new Error('Invalid'); });
            
            await expect(passwordResetService.resetPassword('t', 'newPass123')).rejects.toThrow('El enlace de recuperación es inválido o ha expirado.');
        });

        it('debe lanzar error si contraseña es muy corta', async () => {
            jwt.decode.mockReturnValue({ email: 'a@a.com' });
            usuarioDao.findByEmail.mockResolvedValue([{ Contraseña: 'hash' }]);
            jwt.verify.mockReturnValue();

            await expect(passwordResetService.resetPassword('t', '123')).rejects.toThrow('La contraseña debe tener al menos 6 caracteres.');
        });

        it('debe cambiar contraseña si todo es correcto', async () => {
            jwt.decode.mockReturnValue({ email: 'a@a.com' });
            usuarioDao.findByEmail.mockResolvedValue([{ ID_Usuario: '1', Contraseña: 'hash' }]);
            jwt.verify.mockReturnValue();
            bcrypt.hash.mockResolvedValue('newHash');

            await passwordResetService.resetPassword('t', '123456');

            expect(usuarioDao.updatePassword).toHaveBeenCalledWith('1', 'newHash');
        });
    });
});
