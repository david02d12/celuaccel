const notificacionAdminService = require('../../services/notificacionAdmin.service');
const notificacionDao = require('../../dao/notificacion.dao');

jest.mock('../../dao/notificacion.dao');

describe('Notificacion Admin Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe listar', async () => {
            notificacionDao.getAll.mockResolvedValue([{ ID_Notificacion: 1, Mensaje: 'test' }]);
            const res = await notificacionAdminService.listar();
            expect(res[0].Codigo_Notificaciones).toBe(1);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error si no hay Mensaje', async () => {
            await expect(notificacionAdminService.agregar({})).rejects.toThrow('El campo Mensaje es obligatorio.');
        });
        it('debe agregar', async () => {
            notificacionDao.create.mockResolvedValue({ insertId: 1 });
            await expect(notificacionAdminService.agregar({ Mensaje: 'test' })).resolves.toBeUndefined();
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error', async () => {
            await expect(notificacionAdminService.actualizar({})).rejects.toThrow('El campo ID_Notificacion es obligatorio para actualizar.');
        });
        it('debe actualizar', async () => {
            notificacionDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(notificacionAdminService.actualizar({ ID_Notificacion: 1, Mensaje: 'M' })).resolves.toBeUndefined();
        });
    });

    describe('eliminar', () => {
        it('debe eliminar', async () => {
            notificacionDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(notificacionAdminService.eliminar(1)).resolves.toBeUndefined();
        });
    });

    describe('enviar', () => {
        it('debe lanzar error si faltan datos', async () => {
            await expect(notificacionAdminService.enviar({}, 'admin')).rejects.toThrow('ID_Usuario_Destino y Mensaje son obligatorios.');
        });
        it('debe enviar', async () => {
            notificacionDao.crearDirigida = jest.fn().mockResolvedValue({ insertId: 1 });
            const res = await notificacionAdminService.enviar({ ID_Usuario_Destino: 1, Mensaje: 'test' }, 'admin');
            expect(res.message).toBe('Notificación enviada al cliente.');
        });
    });
});
