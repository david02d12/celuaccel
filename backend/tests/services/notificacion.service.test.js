const notificacionService = require('../../services/notificacion.service');
const notificacionDao = require('../../dao/notificacion.dao');
const usuarioDao = require('../../dao/usuario.dao');

jest.mock('../../dao/notificacion.dao');
jest.mock('../../dao/usuario.dao');

describe('Notificacion Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('misNotificaciones', () => {
        it('debe lanzar error si falta user', async () => {
            await expect(notificacionService.misNotificaciones(null)).rejects.toThrow('Usuario no autenticado.');
        });

        it('debe devolver formateado', async () => {
            notificacionDao.getByUsuario.mockResolvedValue([{ ID_Notificacion: 1, Mensaje: 'M' }]);
            const res = await notificacionService.misNotificaciones('u1');
            expect(res[0].Mensaje).toBe('M');
            expect(res[0].Codigo_Notificaciones).toBe(1);
        });
    });

    describe('contarNoLeidas', () => {
        it('debe contar', async () => {
            notificacionDao.contarNoLeidas.mockResolvedValue([{ total: 5 }]);
            const res = await notificacionService.contarNoLeidas('u1');
            expect(res).toEqual({ count: 5, total: 5 });
        });
    });

    describe('marcarLeida', () => {
        it('debe lanzar error si falta id', async () => {
            await expect(notificacionService.marcarLeida(null)).rejects.toThrow('El ID de la notificación es obligatorio.');
        });

        it('debe lanzar error si no existe', async () => {
            notificacionDao.findById.mockResolvedValue([]);
            await expect(notificacionService.marcarLeida(1)).rejects.toThrow('Notificación no encontrada.');
        });

        it('debe lanzar error si leida por otro sin rol', async () => {
            notificacionDao.findById.mockResolvedValue([{ ID_Usuario_Destino: 'other' }]);
            usuarioDao.getRol.mockResolvedValue([{ Codigo_Rol: 2 }]);
            await expect(notificacionService.marcarLeida(1, 'me')).rejects.toThrow('Acceso denegado.');
        });

        it('debe marcar si es el dueño', async () => {
            notificacionDao.findById.mockResolvedValue([{ ID_Usuario_Destino: 'me' }]);
            notificacionDao.marcarLeida.mockResolvedValue();
            await expect(notificacionService.marcarLeida(1, 'me')).resolves.toBeUndefined();
        });
    });

    describe('marcarTodasLeidas', () => {
        it('debe marcar todas', async () => {
            notificacionDao.marcarTodasLeidas.mockResolvedValue();
            await expect(notificacionService.marcarTodasLeidas('u1')).resolves.toBeUndefined();
        });
    });
});
