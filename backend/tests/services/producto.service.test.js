const productoService = require('../../services/producto.service');
const productoDao = require('../../dao/producto.dao');

jest.mock('../../dao/producto.dao');

describe('Producto Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('debe listar todos los productos', async () => {
            productoDao.getAll.mockResolvedValue([{ id: 1 }]);
            const res = await productoService.listar();
            expect(res).toEqual([{ id: 1 }]);
            expect(productoDao.getAll).toHaveBeenCalled();
        });
    });

    describe('listarPublicos', () => {
        it('debe listar productos publicos', async () => {
            productoDao.getPublicos.mockResolvedValue([{ id: 2 }]);
            const res = await productoService.listarPublicos();
            expect(res).toEqual([{ id: 2 }]);
            expect(productoDao.getPublicos).toHaveBeenCalled();
        });
    });

    describe('agregar', () => {
        it('debe lanzar error si faltan campos obligatorios', async () => {
            await expect(productoService.agregar({})).rejects.toThrow('Los campos Codigo_Producto, Nombre y Precio son obligatorios.');
        });

        it('debe lanzar error si cantidad es negativa', async () => {
            await expect(productoService.agregar({ Codigo_Producto: 'A', Nombre: 'B', Precio: 1, Cantidad: -5 })).rejects.toThrow('La cantidad inicial del producto no puede ser negativa.');
        });

        it('debe agregar producto correctamente', async () => {
            productoDao.create.mockResolvedValue();
            await expect(productoService.agregar({ Codigo_Producto: 'A', Nombre: 'B', Precio: 10 })).resolves.toBeUndefined();
        });

        it('debe lanzar error si producto ya existe', async () => {
            const error = new Error();
            error.code = 'ER_DUP_ENTRY';
            productoDao.create.mockRejectedValue(error);
            await expect(productoService.agregar({ Codigo_Producto: 'A', Nombre: 'B', Precio: 10 })).rejects.toThrow('El producto ya existe.');
        });
    });

    describe('actualizar', () => {
        it('debe lanzar error si falta codigo de producto', async () => {
            await expect(productoService.actualizar({})).rejects.toThrow('El campo Codigo_Producto es obligatorio para actualizar.');
        });

        it('debe actualizar si es correcto', async () => {
            productoDao.update.mockResolvedValue({ affectedRows: 1 });
            await expect(productoService.actualizar({ Codigo_Producto: 'A' })).resolves.toBeUndefined();
        });

        it('debe lanzar error si no se encuentra', async () => {
            productoDao.update.mockResolvedValue({ affectedRows: 0 });
            await expect(productoService.actualizar({ Codigo_Producto: 'A' })).rejects.toThrow('Producto no encontrado.');
        });
    });

    describe('eliminar', () => {
        it('debe lanzar error si falta ID', async () => {
            await expect(productoService.eliminar(null)).rejects.toThrow('El código del producto es obligatorio.');
        });

        it('debe eliminar si es correcto', async () => {
            productoDao.remove.mockResolvedValue({ affectedRows: 1 });
            await expect(productoService.eliminar('A')).resolves.toBeUndefined();
        });

        it('debe lanzar error si no encuentra para eliminar', async () => {
            productoDao.remove.mockResolvedValue({ affectedRows: 0 });
            await expect(productoService.eliminar('A')).rejects.toThrow('Producto no encontrado.');
        });
    });

    describe('descontarStock', () => {
        it('debe lanzar error si falta ID o cantidad es invalida', async () => {
            await expect(productoService.descontarStock(null)).rejects.toThrow('El código del producto es obligatorio.');
            await expect(productoService.descontarStock('A', 0)).rejects.toThrow('La cantidad a descontar debe ser mayor a cero.');
        });

        it('debe lanzar error si producto no existe', async () => {
            productoDao.findById.mockResolvedValue([]);
            await expect(productoService.descontarStock('A', 1)).rejects.toThrow('Producto no encontrado.');
        });

        it('debe lanzar error si stock actual es 0', async () => {
            productoDao.findById.mockResolvedValue([{ Nombre: 'Prod1', Cantidad: 0 }]);
            await expect(productoService.descontarStock('A', 1)).rejects.toThrow('No se puede realizar la salida: el producto "Prod1" no tiene stock disponible');
        });

        it('debe lanzar error si stock es insuficiente', async () => {
            productoDao.findById.mockResolvedValue([{ Nombre: 'Prod1', Cantidad: 2 }]);
            await expect(productoService.descontarStock('A', 3)).rejects.toThrow('Stock insuficiente. Disponible: 2 unidad(es) — Solicitado: 3.');
        });

        it('debe descontar correctamente', async () => {
            productoDao.findById.mockResolvedValue([{ Nombre: 'Prod1', Cantidad: 5 }]);
            productoDao.descontarStock.mockResolvedValue({ affectedRows: 1 });
            const res = await productoService.descontarStock('A', 2);
            expect(res).toEqual({ message: 'Stock actualizado. Unidades descontadas: 2.' });
        });

        it('debe lanzar error si affectedRows es 0', async () => {
            productoDao.findById.mockResolvedValue([{ Nombre: 'Prod1', Cantidad: 5 }]);
            productoDao.descontarStock.mockResolvedValue({ affectedRows: 0 });
            await expect(productoService.descontarStock('A', 2)).rejects.toThrow('No se pudo descontar el stock (posible condición de carrera). Intenta de nuevo.');
        });
    });
});
