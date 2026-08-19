const mensajeService = require('../../services/mensaje.service');
const mensajeDao = require('../../dao/mensaje.dao');
const notificacionAdminService = require('../../services/notificacionAdmin.service');

jest.mock('../../dao/mensaje.dao');
jest.mock('../../services/notificacionAdmin.service');

describe('Mensaje Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listarPorChat', () => {
        it('debe listar', async () => {
            mensajeDao.getByChat.mockResolvedValue([{ id: 1 }]);
            const res = await mensajeService.listarPorChat(1);
            expect(res).toEqual([{ id: 1 }]);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error', async () => {
            await expect(mensajeService.agregar({})).rejects.toThrow('Los campos Codigo_Chat, ID_Usuario y Mensaje son obligatorios.');
        });
        it('debe agregar', async () => {
            mensajeDao.create.mockResolvedValue({ insertId: 1 });
            notificacionAdminService.enviarPorChat = jest.fn().mockResolvedValue();
            await expect(mensajeService.agregar({ Codigo_Chat: 1, ID_Usuario: 1, Mensaje: 'hola' })).resolves.toBeDefined();
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error', async () => {
            await expect(mensajeService.actualizar({})).rejects.toThrow('El campo Codigo_Mensaje es obligatorio para actualizar.');
        });
        it('debe actualizar', async () => {
            mensajeDao.findWithOwnerCheck = jest.fn().mockResolvedValue([{ id: 1 }]);
            mensajeDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(mensajeService.actualizar({ Codigo_Mensaje: 1 }, 'u1')).resolves.toBeUndefined();
        });
    });

    describe('eliminar', () => {
        it('debe eliminar', async () => {
            mensajeDao.findWithOwnerCheck = jest.fn().mockResolvedValue([{ id: 1 }]);
            mensajeDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(mensajeService.eliminar(1, 'u1')).resolves.toBeUndefined();
        });
    });
});
