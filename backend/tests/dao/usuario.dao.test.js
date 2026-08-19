const usuarioDao = require('../../dao/usuario.dao');
const db = require('../../config/db');

jest.mock('../../config/db', () => ({
    queryPromise: jest.fn(),
    getConnection: jest.fn((cb) => cb(null, { release: jest.fn() }))
}));

describe('Usuario DAO', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getAll debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await usuarioDao.getAll();
        expect(res).toEqual([{ id: 1 }]);
    });

    it('findByEmail debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await usuarioDao.findByEmail('a@a.com');
        expect(res).toEqual([{ id: 1 }]);
    });

    it('findById debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await usuarioDao.findById('u1');
        expect(res).toEqual([{ id: 1 }]);
    });

    it('create debe crear', async () => {
        db.queryPromise.mockResolvedValue({ insertId: 1 });
        const res = await usuarioDao.create({ ID_Usuario: 'u', Nombre: 'n', Apellido: 'a', Correo: 'c', Clave: 'c', Telefono: 't', Direccion: 'd' });
        expect(res.insertId).toBe(1);
    });

    it('update debe actualizar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await usuarioDao.update({ Nombre: 'n', Apellido: 'a', Correo: 'c', hashedClave: 'h', Telefono: 't', Direccion: 'd', Codigo_Rol: 1, Codigo_TipoDocumento: 1, ID_Usuario: 'u' });
        expect(res.affectedRows).toBe(1);
    });

    it('updateMiPerfil debe actualizar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await usuarioDao.updateMiPerfil({ Nombre: 'n', Apellido: 'a', Correo: 'c', Telefono: 't', Direccion: 'd', Codigo_TipoDocumento: 1, ID_Usuario: 'u' });
        expect(res.affectedRows).toBe(1);
    });

    it('remove debe eliminar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await usuarioDao.remove('u');
        expect(res.affectedRows).toBe(1);
    });

    it('updatePassword debe actualizar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await usuarioDao.updatePassword('u', 'hash');
        expect(res.affectedRows).toBe(1);
    });

    it('getRol debe retornar rol', async () => {
        db.queryPromise.mockResolvedValue([{ Codigo_Rol: 1 }]);
        const res = await usuarioDao.getRol('u');
        expect(res).toEqual([{ Codigo_Rol: 1 }]);
    });

    it('countAdmins debe contar', async () => {
        db.queryPromise.mockResolvedValue([[{ total: 2 }]]);
        const res = await usuarioDao.countAdmins();
        expect(res).toBe(2);
    });

    it('getAll debe manejar error', async () => {
        db.queryPromise.mockRejectedValue(new Error('err'));
        await expect(usuarioDao.getAll()).rejects.toThrow('err');
    });
});
