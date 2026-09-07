const authService = require('../../services/auth.service');
const usuarioDao = require('../../dao/usuario.dao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../dao/usuario.dao');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registro', () => {
        it('debe lanzar error si faltan campos obligatorios', async () => {
            const userData = { ID_Usuario: '', Nombre: '', Correo: '', Clave: '' };
            await expect(authService.registro(userData)).rejects.toThrow('Los campos ID_Usuario, Nombre, Correo y Clave son obligatorios.');
        });

        it('debe lanzar error si la contraseña es menor a 6 caracteres', async () => {
            const userData = { ID_Usuario: '1', Nombre: 'A', Correo: 'a@a.com', Clave: '12345' };
            await expect(authService.registro(userData)).rejects.toThrow('La contraseña debe tener al menos 6 caracteres.');
        });

        it('debe registrar un usuario correctamente', async () => {
            const userData = { ID_Usuario: '1', Nombre: 'A', Correo: 'a@a.com', Clave: '123456' };
            bcrypt.hash.mockResolvedValue('hashedClave');
            usuarioDao.create.mockResolvedValue(true);

            await expect(authService.registro(userData)).resolves.toBeUndefined();
            expect(usuarioDao.create).toHaveBeenCalledWith(expect.objectContaining({
                ID_Usuario: '1',
                hashedClave: 'hashedClave'
            }));
        });

        it('debe lanzar error si el usuario ya existe', async () => {
            const userData = { ID_Usuario: '1', Nombre: 'A', Correo: 'a@a.com', Clave: '123456' };
            bcrypt.hash.mockResolvedValue('hashedClave');
            const error = new Error();
            error.code = 'ER_DUP_ENTRY';
            usuarioDao.create.mockRejectedValue(error);

            await expect(authService.registro(userData)).rejects.toThrow('El usuario ya existe en el sistema.');
        });
    });

    describe('login', () => {
        it('debe lanzar error si faltan credenciales', async () => {
            await expect(authService.login('', '')).rejects.toThrow('Usuario y contraseña son obligatorios.');
        });

        it('debe lanzar error si el usuario no existe', async () => {
            usuarioDao.findByUsername.mockResolvedValue([]);
            await expect(authService.login('user', 'pass')).rejects.toThrow('Credenciales incorrectas.');
        });

        it('debe lanzar error si la contraseña es incorrecta', async () => {
            usuarioDao.findByUsername.mockResolvedValue([{ Contraseña: 'hashedPassword' }]);
            bcrypt.compare.mockResolvedValue(false);
            
            await expect(authService.login('user', 'pass')).rejects.toThrow('Credenciales incorrectas.');
        });

        it('debe retornar token y datos del usuario si las credenciales son correctas', async () => {
            const dbUser = { ID_Usuario: '123', Nombre: 'Test', Codigo_Rol: 1, Contraseña: 'hashedPassword' };
            usuarioDao.findByUsername.mockResolvedValue([dbUser]);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');

            const result = await authService.login('user', 'pass');

            expect(result).toEqual({
                auth: true,
                token: 'mockToken',
                user: '123',
                nombre: 'Test',
                role: 1
            });
            expect(jwt.sign).toHaveBeenCalled();
        });
    });

    describe('changePassword', () => {
        it('debe lanzar error si faltan campos', async () => {
            await expect(authService.changePassword('', '', '')).rejects.toThrow('Todos los campos son obligatorios.');
        });

        it('debe lanzar error si la contraseña actual es incorrecta', async () => {
            usuarioDao.findByUsername.mockResolvedValue([{ Contraseña: 'oldHash' }]);
            bcrypt.compare.mockResolvedValue(false);
            
            await expect(authService.changePassword('user', 'wrongOld', 'newPass123')).rejects.toThrow('La contraseña actual es incorrecta.');
        });

        it('debe cambiar la contraseña si todo es correcto', async () => {
            usuarioDao.findByUsername.mockResolvedValue([{ Contraseña: 'oldHash' }]);
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('newHash');
            usuarioDao.updatePassword.mockResolvedValue(true);

            await expect(authService.changePassword('user', 'correctOld', 'newPass123')).resolves.toBeUndefined();
            expect(usuarioDao.updatePassword).toHaveBeenCalledWith('user', 'newHash');
        });
    });
});
