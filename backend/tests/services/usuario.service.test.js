const usuarioService = require('../../services/usuario.service');
const usuarioDao = require('../../dao/usuario.dao');
const bcrypt = require('bcrypt');

jest.mock('../../dao/usuario.dao');
jest.mock('bcrypt');

describe('Usuario Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe retornar todos los usuarios', async () => {
            usuarioDao.getAll.mockResolvedValue([{ id: 1 }]);
            const res = await usuarioService.listar();
            expect(res).toEqual([{ id: 1 }]);
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error si no hay ID_Usuario', async () => {
            await expect(usuarioService.actualizar({}, 'u1')).rejects.toThrow('El campo ID_Usuario es obligatorio para actualizar.');
        });

        it('debe lanzar error si se quita el ultimo admin', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 3 }]);
            usuarioDao.countAdmins.mockResolvedValue(1);
            await expect(usuarioService.actualizar({ ID_Usuario: 'A', Codigo_Rol: 2 }, 'u1')).rejects.toThrow('No puedes quitar el rol de administrador porque debe haber al menos un administrador en el sistema.');
        });

        it('debe procesar la clave si se envía', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            usuarioDao.update.mockResolvedValue({ affectedRows: 1 });
            bcrypt.hash.mockResolvedValue('hash');
            await usuarioService.actualizar({ ID_Usuario: 'A', Clave: '123456' }, 'u1');
            expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
            expect(usuarioDao.update).toHaveBeenCalledWith(expect.objectContaining({ hashedClave: 'hash' }));
        });

        it('debe lanzar error si la clave es muy corta', async () => {
            await expect(usuarioService.actualizar({ ID_Usuario: 'A', Clave: '123' }, 'u1')).rejects.toThrow('La contraseña debe tener al menos 6 caracteres.');
        });

        it('debe lanzar error si no se encuentra el usuario', async () => {
            usuarioDao.getRol.mockResolvedValue([]);
            usuarioDao.update.mockResolvedValue({ affectedRows: 0 });
            await expect(usuarioService.actualizar({ ID_Usuario: 'A' }, 'u1')).rejects.toThrow('Usuario no encontrado.');
        });
    });

    describe('eliminar', () => {
        it('debe lanzar error si falta ID', async () => {
            await expect(usuarioService.eliminar(null)).rejects.toThrow('El ID del usuario es obligatorio.');
        });

        it('debe lanzar error si elimina el ultimo admin', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 3 }]);
            usuarioDao.countAdmins.mockResolvedValue(1);
            await expect(usuarioService.eliminar('A')).rejects.toThrow('No puedes eliminar a este usuario porque es el único administrador en el sistema.');
        });

        it('debe eliminar correctamente', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            usuarioDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(usuarioService.eliminar('A')).resolves.toBeUndefined();
        });

        it('debe lanzar error si no lo encuentra', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            usuarioDao.remove.mockResolvedValue({ affectedRows: 0 });
            await expect(usuarioService.eliminar('A')).rejects.toThrow('Usuario no encontrado.');
        });
    });

    describe('perfilPublico', () => {
        it('debe lanzar error si no hay ID', async () => {
            await expect(usuarioService.perfilPublico(null, 'u1')).rejects.toThrow('El ID del usuario es obligatorio.');
        });

        it('debe lanzar error si solicitante no tiene rol', async () => {
            usuarioDao.getRol.mockResolvedValue([]);
            await expect(usuarioService.perfilPublico('A', 'u1')).rejects.toThrow('No autorizado.');
        });

        it('debe lanzar error si busca a otro y no es admin o tecnico', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            await expect(usuarioService.perfilPublico('A', 'B')).rejects.toThrow('No tienes permiso para ver este perfil.');
        });

        it('debe permitir buscar su propio perfil', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            usuarioDao.findById.mockResolvedValue([{ id: 'A' }]);
            const res = await usuarioService.perfilPublico('A', 'A');
            expect(res).toEqual({ id: 'A' });
        });

        it('debe lanzar error si el usuario buscado no existe', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 3 }]); // Admin puede buscar a cualquiera
            usuarioDao.findById.mockResolvedValue([]);
            await expect(usuarioService.perfilPublico('A', 'admin')).rejects.toThrow('Usuario no encontrado.');
        });
    });

    describe('actualizarMiPerfil', () => {
        it('debe lanzar error si falta nombre o correo', async () => {
            await expect(usuarioService.actualizarMiPerfil('A', { Nombre: 'N' })).rejects.toThrow('Nombre y correo son obligatorios.');
        });

        it('debe actualizar mi perfil', async () => {
            usuarioDao.updateMiPerfil.mockResolvedValue({ affectedRows: 1 });
            await expect(usuarioService.actualizarMiPerfil('A', { Nombre: 'N', Correo: 'C' })).resolves.toBeUndefined();
        });

        it('debe lanzar error si affectedRows es 0', async () => {
            usuarioDao.updateMiPerfil.mockResolvedValue({ affectedRows: 0 });
            await expect(usuarioService.actualizarMiPerfil('A', { Nombre: 'N', Correo: 'C' })).rejects.toThrow('Usuario no encontrado.');
        });
    });
});
