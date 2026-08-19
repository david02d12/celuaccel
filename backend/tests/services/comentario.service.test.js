const comentarioService = require('../../services/comentario.service');
const comentarioDao = require('../../dao/comentario.dao');
const usuarioDao = require('../../dao/usuario.dao');
const servicioDao = require('../../dao/servicio.dao');
const profanity = require('../../config/profanity');

jest.mock('../../dao/comentario.dao');
jest.mock('../../dao/usuario.dao');
jest.mock('../../dao/servicio.dao');
jest.mock('../../config/profanity');

describe('Comentario Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        profanity.detectarMalasPalabras.mockReturnValue([]);
    });

    describe('listar', () => {
        it('debe listar', async () => {
            comentarioDao.getAll.mockResolvedValue([{ id: 1 }]);
            const res = await comentarioService.listar();
            expect(res).toEqual([{ id: 1 }]);
        });
    });

    describe('promedio', () => {
        it('debe calcular', async () => {
            comentarioDao.getPromedio.mockResolvedValue([{ promedio: 4.5, total: 10, cinco: 5, cuatro: 5, tres: 0, dos: 0, uno: 0 }]);
            const res = await comentarioService.promedio();
            expect(res.promedio).toBe(4.5);
            expect(res.total).toBe(10);
            expect(res.distribucion.cinco).toBe(5);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error si faltan datos', async () => {
            await expect(comentarioService.agregar({}, 'u1')).rejects.toThrow('Los campos ID_Usuario y Comentario son obligatorios.');
        });

        it('debe lanzar error por malas palabras', async () => {
            profanity.detectarMalasPalabras.mockReturnValue(['bad']);
            await expect(comentarioService.agregar({ ID_Usuario: 'u1', Comentario: 'bad' }, 'u1')).rejects.toThrow('Tu comentario contiene lenguaje inapropiado: bad. Por favor, modifícalo.');
        });

        it('debe lanzar error si es cliente comentando para otro', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            await expect(comentarioService.agregar({ ID_Usuario: 'other', Comentario: 'ok' }, 'me')).rejects.toThrow('Acceso denegado: no puedes publicar comentarios en nombre de otro usuario.');
        });

        it('debe lanzar error si cliente no tiene servicios activos', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            servicioDao.getActivosByUsuario.mockResolvedValue([]);
            await expect(comentarioService.agregar({ ID_Usuario: 'u1', Comentario: 'ok' }, 'u1')).rejects.toThrow('Debes haber realizado al menos un servicio para poder publicar un comentario.');
        });

        it('debe agregar si todo es valido', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            servicioDao.getActivosByUsuario.mockResolvedValue([{ id: 1 }]);
            comentarioDao.create.mockResolvedValue({ insertId: 5 });
            const res = await comentarioService.agregar({ ID_Usuario: 'u1', Comentario: 'ok', Estrellas: 5 }, 'u1');
            expect(res).toEqual({ message: 'Comentario publicado correctamente.', id: 5 });
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error si falta id', async () => {
            await expect(comentarioService.actualizar({}, 'u1')).rejects.toThrow('El campo Codigo_Comentario es obligatorio.');
        });

        it('debe lanzar error por malas palabras', async () => {
            profanity.detectarMalasPalabras.mockReturnValue(['bad']);
            await expect(comentarioService.actualizar({ Codigo_Comentario: 1, Comentario: 'bad' }, 'u1')).rejects.toThrow('lenguaje inapropiado');
        });

        it('debe lanzar error si comentario no existe', async () => {
            comentarioDao.findById.mockResolvedValue([]);
            await expect(comentarioService.actualizar({ Codigo_Comentario: 1 }, 'u1')).rejects.toThrow('Comentario no encontrado.');
        });

        it('debe lanzar error si edita comentario de otro y no es admin', async () => {
            comentarioDao.findById.mockResolvedValue([{ ID_Usuario: 'other' }]);
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            await expect(comentarioService.actualizar({ Codigo_Comentario: 1 }, 'me')).rejects.toThrow('No puedes modificar comentarios de otros usuarios.');
        });

        it('debe actualizar si todo es correcto', async () => {
            comentarioDao.findById.mockResolvedValue([{ ID_Usuario: 'me' }]);
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            comentarioDao.update.mockResolvedValue();
            await expect(comentarioService.actualizar({ Codigo_Comentario: 1, Comentario: 'ok' }, 'me')).resolves.toBeUndefined();
        });
    });

    describe('eliminar', () => {
        it('debe lanzar error si no hay ID', async () => {
            await expect(comentarioService.eliminar(null)).rejects.toThrow('El ID del comentario es obligatorio.');
        });

        it('debe eliminar si es admin', async () => {
            comentarioDao.findById.mockResolvedValue([{ ID_Usuario: 'other' }]);
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 3 }]);
            comentarioDao.remove.mockResolvedValue();
            await expect(comentarioService.eliminar(1, 'admin')).resolves.toBeUndefined();
        });
    });
});
