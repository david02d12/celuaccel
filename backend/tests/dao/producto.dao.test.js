const productoDao = require('../../dao/producto.dao');
const db = require('../../config/db');

jest.mock('../../config/db', () => ({
    queryPromise: jest.fn()
}));

describe('Producto DAO', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getAll debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await productoDao.getAll();
        expect(res).toEqual([{ id: 1 }]);
    });

    it('findById debe retornar', async () => {
        db.queryPromise.mockResolvedValue([{ id: 1 }]);
        const res = await productoDao.findById(1);
        expect(res).toEqual([{ id: 1 }]);
    });

    it('create debe crear', async () => {
        db.queryPromise.mockResolvedValue({ insertId: 1 });
        const res = await productoDao.create({ Nombre_Producto: 'n', Descripcion: 'd', Precio: 1, Stock: 1, Codigo_Categoria: 1, ImagenUrl: 'i' });
        expect(res.insertId).toBe(1);
    });

    it('update debe actualizar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await productoDao.update({ Nombre_Producto: 'n', Descripcion: 'd', Precio: 1, Stock: 1, Codigo_Categoria: 1, ImagenUrl: 'i', Codigo_Producto: 1 });
        expect(res.affectedRows).toBe(1);
    });

    it('remove debe eliminar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await productoDao.remove(1);
        expect(res.affectedRows).toBe(1);
    });

    it('actualizarStock debe actualizar', async () => {
        db.queryPromise.mockResolvedValue({ affectedRows: 1 });
        const res = await productoDao.descontarStock(1, 10);
        expect(res.affectedRows).toBe(1);
    });
});
