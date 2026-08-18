const chatService = require('../../services/chat.service');
const chatDao = require('../../dao/chat.dao');

jest.mock('../../dao/chat.dao');

describe('Chat Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe listar todos', async () => {
            chatDao.getAll.mockResolvedValue([{ Codigo_Chat: 1 }]);
            const res = await chatService.listar();
            expect(res).toEqual([{ Codigo_Chat: 1 }]);
        });
    });

    describe('listarMios', () => {
        it('debe lanzar error si no hay ID', async () => {
            await expect(chatService.listarMios(null)).rejects.toThrow('Usuario no autenticado.');
        });

        it('debe retornar chats unicos', async () => {
            chatDao.getMios.mockResolvedValue([{ Codigo_Chat: 1 }, { Codigo_Chat: 1 }, { Codigo_Chat: 2 }]);
            const res = await chatService.listarMios('u1');
            expect(res).toEqual([{ Codigo_Chat: 1 }, { Codigo_Chat: 2 }]);
        });
    });

    describe('agregar', () => {
        it('debe lanzar error si falta usuario', async () => {
            await expect(chatService.agregar({ ID_Servicio: 1 })).rejects.toThrow('El campo ID_Usuario es obligatorio.');
        });

        it('debe crear un chat si no hay servicio asociado', async () => {
            chatDao.create.mockResolvedValue({ insertId: 5 });
            const res = await chatService.agregar({ ID_Usuario: 'u1' });
            expect(res).toEqual({ message: 'Chat de consulta creado correctamente.', id: 5, existente: false });
        });

        it('debe devolver existente si el servicio ya tiene chat', async () => {
            chatDao.findByServicio.mockResolvedValue([{ Codigo_Chat: 10 }]);
            const res = await chatService.agregar({ ID_Usuario: 'u1', ID_Servicio: 1 });
            expect(res).toEqual({ message: 'Ya existe un chat para este servicio.', id: 10, existente: true });
        });

        it('debe crear nuevo si el servicio no tiene chat', async () => {
            chatDao.findByServicio.mockResolvedValue([]);
            chatDao.create.mockResolvedValue({ insertId: 6 });
            const res = await chatService.agregar({ ID_Usuario: 'u1', ID_Servicio: 1 });
            expect(res).toEqual({ message: 'Chat creado correctamente.', id: 6, existente: false });
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error si no hay ID', async () => {
            await expect(chatService.actualizar({})).rejects.toThrow('El campo Codigo_Chat es obligatorio para actualizar.');
        });

        it('debe actualizar correctamente', async () => {
            chatDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(chatService.actualizar({ Codigo_Chat: 1 })).resolves.toBeUndefined();
        });

        it('debe lanzar error si affectedRows es 0', async () => {
            chatDao.update.mockResolvedValue({ affectedRows: 0 });
            await expect(chatService.actualizar({ Codigo_Chat: 1 })).rejects.toThrow('Chat no encontrado.');
        });
    });

    describe('eliminar', () => {
        it('debe lanzar error si falta id', async () => {
            await expect(chatService.eliminar(null)).rejects.toThrow('El ID del chat es obligatorio.');
        });

        it('debe eliminar correctamente', async () => {
            chatDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(chatService.eliminar(1)).resolves.toBeUndefined();
        });

        it('debe lanzar error si no encuentra chat', async () => {
            chatDao.remove.mockResolvedValue({ affectedRows: 0 });
            await expect(chatService.eliminar(1)).rejects.toThrow('Chat no encontrado.');
        });
    });
});
