const preguntaService = require('../../services/pregunta.service');
const preguntaDao = require('../../dao/pregunta.dao');
const usuarioDao = require('../../dao/usuario.dao');

jest.mock('../../dao/pregunta.dao');
jest.mock('../../dao/usuario.dao');

describe('Pregunta Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe listar todas', async () => {
            preguntaDao.getAll.mockResolvedValue([{ ID_Consulta: 1 }]);
            const res = await preguntaService.listar();
            expect(res).toEqual([{ ID_Consulta: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error si faltan datos', async () => {
            await expect(preguntaService.agregar({}, 'u1')).rejects.toThrow('Los campos ID_Usuario, Codigo_Producto y Pregunta son obligatorios.');
        });

        it('debe lanzar error si no hay userId', async () => {
            await expect(preguntaService.agregar({ ID_Usuario: 'u1', Codigo_Producto: 1, Pregunta: '?' }, null)).rejects.toThrow('Usuario no autenticado.');
        });

        it('debe lanzar error si pregunta por otro usuario y es cliente', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            await expect(preguntaService.agregar({ ID_Usuario: 'other', Codigo_Producto: 1, Pregunta: '?' }, 'me')).rejects.toThrow('Acceso denegado: no puedes preguntar en nombre de otro usuario.');
        });

        it('debe agregar si es cliente preguntando por si mismo', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            preguntaDao.create.mockResolvedValue({ insertId: 10 });
            const res = await preguntaService.agregar({ ID_Usuario: 'me', Codigo_Producto: 1, Pregunta: '?' }, 'me');
            expect(res).toEqual({ insertId: 10 });
            expect(preguntaDao.create).toHaveBeenCalledWith(expect.objectContaining({ ID_Usuario: 'me' }));
        });

        it('debe agregar si es admin o tecnico en nombre de otro', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 1 }]);
            preguntaDao.create.mockResolvedValue({ insertId: 11 });
            const res = await preguntaService.agregar({ ID_Usuario: 'client', Codigo_Producto: 1, Pregunta: '?' }, 'tecnico');
            expect(res).toEqual({ insertId: 11 });
            expect(preguntaDao.create).toHaveBeenCalledWith(expect.objectContaining({ ID_Usuario: 'client' }));
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error si falta ID_Consulta', async () => {
            await expect(preguntaService.actualizar({})).rejects.toThrow('El campo ID_Consulta es obligatorio para actualizar.');
        });

        it('debe actualizar si correcto', async () => {
            preguntaDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(preguntaService.actualizar({ ID_Consulta: 1 })).resolves.toBeUndefined();
        });

        it('debe lanzar error si affectedRows es 0', async () => {
            preguntaDao.update.mockResolvedValue({ affectedRows: 0 });
            await expect(preguntaService.actualizar({ ID_Consulta: 1 })).rejects.toThrow('Pregunta no encontrada.');
        });
    });

    describe('eliminar', () => {
        it('debe lanzar error si no hay ID', async () => {
            await expect(preguntaService.eliminar(null)).rejects.toThrow('El ID de la consulta es obligatorio.');
        });

        it('debe eliminar correctamente', async () => {
            preguntaDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(preguntaService.eliminar(1)).resolves.toBeUndefined();
        });

        it('debe lanzar error si no encuentra', async () => {
            preguntaDao.remove.mockResolvedValue({ affectedRows: 0 });
            await expect(preguntaService.eliminar(1)).rejects.toThrow('Pregunta no encontrada.');
        });
    });

    describe('listarMias', () => {
        it('debe lanzar error si no hay userId', async () => {
            await expect(preguntaService.listarMias(null)).rejects.toThrow('Usuario no autenticado.');
        });

        it('debe retornar las preguntas', async () => {
            preguntaDao.getByUsuario.mockResolvedValue([{ ID_Consulta: 1 }]);
            const res = await preguntaService.listarMias('u1');
            expect(res).toEqual([{ ID_Consulta: 1 }]);
        });
    });

    describe('responder', () => {
        it('debe lanzar error si falta ID_Consulta o Respuesta', async () => {
            await expect(preguntaService.responder({}, 'u1')).rejects.toThrow('Los campos ID_Consulta y Respuesta son obligatorios.');
        });

        it('debe responder correctamente', async () => {
            preguntaDao.responder.mockResolvedValue({ affectedRows: 1 });
            await expect(preguntaService.responder({ ID_Consulta: 1, Respuesta: 'R' }, 'tecnico')).resolves.toBeUndefined();
            expect(preguntaDao.responder).toHaveBeenCalledWith(expect.objectContaining({ ID_Tecnico_Responde: 'tecnico' }));
        });

        it('debe lanzar error si affectedRows es 0', async () => {
            preguntaDao.responder.mockResolvedValue({ affectedRows: 0 });
            await expect(preguntaService.responder({ ID_Consulta: 1, Respuesta: 'R' }, 'tecnico')).rejects.toThrow('Pregunta no encontrada.');
        });
    });
});
