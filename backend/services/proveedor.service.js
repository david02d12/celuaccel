const AppError = require('../config/AppError');
const proveedorDao = require('../dao/proveedor.dao');
const productoDao  = require('../dao/producto.dao');

// ══════════════════════════════════════════════════════════════
//  PROVEEDORES
// ══════════════════════════════════════════════════════════════

const listarProveedores = () => proveedorDao.getAllProveedores();

const agregarProveedor = async ({ Nombre_Empresa, NIT, Telefono, Correo, Direccion, Contacto }) => {
    if (!Nombre_Empresa) throw new AppError('El nombre de la empresa es obligatorio.', 400);
    try {
        const result = await proveedorDao.createProveedor({ Nombre_Empresa, NIT, Telefono, Correo, Direccion, Contacto });
        return { message: 'Proveedor creado correctamente.', id: result.insertId };
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('El proveedor ya existe (NIT duplicado).', 409);
        throw err;
    }
};

const actualizarProveedor = async (data) => {
    if (!data.ID_Proveedor) throw new AppError('El ID_Proveedor es obligatorio para actualizar.', 400);
    const result = await proveedorDao.updateProveedor(data);
    if (result.affectedRows === 0) throw new AppError('Proveedor no encontrado.', 404);
};

const eliminarProveedor = async (id) => {
    if (!id) throw new AppError('El ID_Proveedor es obligatorio.', 400);
    const result = await proveedorDao.removeProveedor(id);
    if (result.affectedRows === 0) throw new AppError('Proveedor no encontrado.', 404);
};

// ══════════════════════════════════════════════════════════════
//  COMPRAS DE REABASTECIMIENTO
// ══════════════════════════════════════════════════════════════

const listarCompras = () => proveedorDao.getAllCompras();

const comprasPorProveedor = async (idProveedor) => {
    if (!idProveedor) throw new AppError('El ID del proveedor es obligatorio.', 400);
    return proveedorDao.getComprasByProveedor(idProveedor);
};

/**
 * RF-018: Registra una compra y actualiza el inventario del producto.
 * Al comprar repuestos al proveedor, el stock del Producto se incrementa.
 */
const registrarCompra = async ({ ID_Proveedor, Codigo_Producto, Cantidad, Precio_Unitario, Fecha_Compra }) => {
    if (!ID_Proveedor || !Codigo_Producto || !Cantidad) {
        throw new AppError('ID_Proveedor, Codigo_Producto y Cantidad son obligatorios.', 400);
    }
    const cantidad = Number(Cantidad);
    if (cantidad <= 0) throw new AppError('La cantidad de compra debe ser mayor a cero.', 400);

    // Verificar que el proveedor exista
    const proveedor = await proveedorDao.findProveedorById(ID_Proveedor);
    if (proveedor.length === 0) throw new AppError('Proveedor no encontrado.', 404);

    // Verificar que el producto exista
    const producto = await productoDao.findById(Codigo_Producto);
    if (producto.length === 0) throw new AppError('Producto no encontrado.', 404);

    // Registrar la compra
    const result = await proveedorDao.createCompra({
        ID_Proveedor, Codigo_Producto, Cantidad: cantidad,
        Precio_Unitario: Precio_Unitario || 0,
        Fecha_Compra: Fecha_Compra || null,
    });

    // Incrementar el stock del producto (operación inversa a descontarStock)
    const { queryPromise: query } = require('../config/db');
    await query(
        'UPDATE Producto SET Cantidad = Cantidad + ? WHERE Codigo_Producto = ?',
        [cantidad, Codigo_Producto]
    );

    return {
        message: `Compra registrada. ${cantidad} unidad(es) de "${producto[0].Nombre}" añadidas al inventario.`,
        id: result.insertId,
    };
};

const eliminarCompra = async (id) => {
    if (!id) throw new AppError('El ID_Compra es obligatorio.', 400);
    const result = await proveedorDao.removeCompra(id);
    if (result.affectedRows === 0) throw new AppError('Compra no encontrada.', 404);
};

module.exports = {
    listarProveedores, agregarProveedor, actualizarProveedor, eliminarProveedor,
    listarCompras, comprasPorProveedor, registrarCompra, eliminarCompra,
};
