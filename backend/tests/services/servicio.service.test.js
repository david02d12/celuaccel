const servicioService = require('../../services/servicio.service');
const servicioDao = require('../../dao/servicio.dao');
const usuarioDao = require('../../dao/usuario.dao');

jest.mock('../../dao/servicio.dao');
jest.mock('../../dao/usuario.dao');

describe('Servicio Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe listar todos los servicios', async () => {
            servicioDao.getAll.mockResolvedValue([{ id: 1 }]);
            const result = await servicioService.listar();
            expect(result).toEqual([{ id: 1 }]);
            expect(servicioDao.getAll).toHaveBeenCalled();
        });
    });

    describe('misServicios', () => {
        it('debe lanzar error si no hay idUsuario', async () => {
            await expect(servicioService.misServicios(null, 'u1')).rejects.toThrow('El ID de usuario es obligatorio.');
        });

        it('debe lanzar error si no tiene permisos', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]); // Rol normal
            await expect(servicioService.misServicios('otherUser', 'myUser')).rejects.toThrow('Acceso denegado: solo puedes ver tus propios servicios.');
        });

        it('debe permitir ver servicios propios', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            servicioDao.getByUsuario.mockResolvedValue([{ id: 1 }]);
            const result = await servicioService.misServicios('myUser', 'myUser');
            expect(result).toEqual([{ id: 1 }]);
        });

        it('debe permitir ver servicios de otros si es admin/tecnico', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 1 }]); // Tecnico
            servicioDao.getByUsuario.mockResolvedValue([{ id: 2 }]);
            const result = await servicioService.misServicios('otherUser', 'tecnico');
            expect(result).toEqual([{ id: 2 }]);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error si faltan campos', async () => {
            await expect(servicioService.agregar({}, 'u1')).rejects.toThrow('Los campos Descripcion e ID_Usuario son obligatorios.');
        });

        it('debe lanzar error si intenta crear para otro sin permisos', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            await expect(servicioService.agregar({ Descripcion: 'D', ID_Usuario: 'other' }, 'me')).rejects.toThrow('Acceso denegado: no puedes crear servicios para otro usuario.');
        });

        it('debe agregar servicio si es para si mismo', async () => {
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            servicioDao.create.mockResolvedValue({ insertId: 5 });
            const result = await servicioService.agregar({ Descripcion: 'D', ID_Usuario: 'me' }, 'me');
            expect(result).toEqual({ insertId: 5 });
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error si falta ID_Servicio', async () => {
            await expect(servicioService.actualizar({})).rejects.toThrow('El campo ID_Servicio es obligatorio para actualizar.');
        });

        it('debe lanzar error si Etapa=2 pero no hay descripcion', async () => {
            await expect(servicioService.actualizar({ ID_Servicio: 1, Etapa: 2, Descripcion: '   ' }))
                .rejects.toThrow('Para completar el servicio (Etapa 2 = Terminado) es obligatorio registrar un diagnóstico final');
        });

        it('debe actualizar si datos son correctos', async () => {
            servicioDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(servicioService.actualizar({ ID_Servicio: 1, Etapa: 1 })).resolves.toBeUndefined();
        });

        it('debe lanzar error si el servicio no existe', async () => {
            servicioDao.update.mockResolvedValue({ affectedRows: 0 });
            await expect(servicioService.actualizar({ ID_Servicio: 1, Etapa: 1 })).rejects.toThrow('Servicio no encontrado.');
        });
    });

    describe('cancelar', () => {
        it('debe lanzar error si no hay id', async () => {
            await expect(servicioService.cancelar(null, 'u1')).rejects.toThrow('El ID del servicio es obligatorio.');
        });

        it('debe lanzar error si servicio no existe', async () => {
            servicioDao.findById.mockResolvedValue([]);
            await expect(servicioService.cancelar(1, 'u1')).rejects.toThrow('Servicio no encontrado.');
        });

        it('debe lanzar error si esta terminado o ya cancelado', async () => {
            servicioDao.findById.mockResolvedValue([{ Etapa: 2, ID_Usuario: 'u1' }]);
            await expect(servicioService.cancelar(1, 'u1')).rejects.toThrow('No se puede cancelar un servicio ya terminado.');

            servicioDao.findById.mockResolvedValue([{ Etapa: -1, ID_Usuario: 'u1' }]);
            await expect(servicioService.cancelar(1, 'u1')).rejects.toThrow('El servicio ya fue cancelado.');
        });

        it('debe cancelar si todo es correcto', async () => {
            servicioDao.findById.mockResolvedValue([{ Etapa: 1, ID_Usuario: 'u1' }]);
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            servicioDao.cancelar.mockResolvedValue({ affectedRows: 1 });

            await expect(servicioService.cancelar(1, 'u1')).resolves.toBeUndefined();
        });

        it('debe lanzar error si lo cancela otro usuario sin rol', async () => {
            servicioDao.findById.mockResolvedValue([{ Etapa: 1, ID_Usuario: 'other' }]);
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            await expect(servicioService.cancelar(1, 'u1')).rejects.toThrow('No tienes permiso para cancelar este servicio.');
        });
    });

    describe('eliminar', () => {
        it('debe lanzar error si falta ID', async () => {
            await expect(servicioService.eliminar(null)).rejects.toThrow('El ID del servicio es obligatorio.');
        });

        it('debe eliminar correctamente', async () => {
            servicioDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(servicioService.eliminar(1)).resolves.toBeUndefined();
        });

        it('debe lanzar error si no se encontró', async () => {
            servicioDao.remove.mockResolvedValue({ affectedRows: 0 });
            await expect(servicioService.eliminar(1)).rejects.toThrow('Servicio no encontrado.');
        });
    });
});
