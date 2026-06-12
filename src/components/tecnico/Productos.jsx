import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';

const Productos = ({ cerrarSesion, setVista }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    Codigo_Producto: '', Cantidad: '', Precio: '', Nombre: '',
    Descripcion: '', Imagen: '', Activo_Catalogo: 1, ID_Categoria: ''
  });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => {
    listar();
    api.get('/categorias/listar')
      .then(res => setCategorias(res.data))
      .catch(() => {});
  }, []);

  const listar = async () => {
    try {
      const res = await api.get('/productos/listar');
      setProductos(res.data);
    } catch (err) { mostrarToast('Error al cargar productos.', false); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/productos/${url}`, form);
      mostrarToast(enEdicion ? 'Producto actualizado correctamente.' : 'Producto registrado en el inventario.');
      listar();
      limpiar();
    } catch (err) { mostrarToast("Error al procesar el producto. Verifica los datos.", false); }
  };

  const eliminar = async (id) => {
    if (window.confirm("¿Eliminar este producto del inventario?")) {
      try {
        await api.delete(`/productos/eliminar/${id}`);
        mostrarToast('Producto eliminado del inventario.');
        listar();
      } catch (err) { mostrarToast('Error al eliminar el producto.', false); }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Producto: '', Cantidad: '', Precio: '', Nombre: '', Descripcion: '', Imagen: '', Activo_Catalogo: 1, ID_Categoria: '' });
    setEnEdicion(false);
  };

  const nombreCategoria = (id) =>
    categorias.find(c => String(c.ID_Categoria) === String(id))?.Nombre_Categoria || '—';

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Inventario de Productos" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Inventario de Productos</h4>
            <p className="mb-0 opacity-75">Controla el stock, precios y visibilidad en el catálogo</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{productos.length} productos</span>
        </div>

        <div className="row">
          {/* PANEL IZQUIERDO: FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">{enEdicion ? "Editar Producto" : "Nuevo Producto"}</h5>
              <input className="form-control mb-2" style={inputStyle} placeholder="Código del producto" value={form.Codigo_Producto} disabled={enEdicion} onChange={e => setForm({...form, Codigo_Producto: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="Nombre del producto" value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} type="number" placeholder="Cantidad en stock" value={form.Cantidad} onChange={e => setForm({...form, Cantidad: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} type="number" placeholder="Precio ($)" value={form.Precio} onChange={e => setForm({...form, Precio: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="Descripción del producto" value={form.Descripcion} onChange={e => setForm({...form, Descripcion: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="URL de imagen (opcional)" value={form.Imagen} onChange={e => setForm({...form, Imagen: e.target.value})} />
              
              <label className="small text-muted fw-bold mb-1">Categoría</label>
              <select className="form-select mb-2" style={inputStyle} value={form.ID_Categoria} onChange={e => setForm({...form, ID_Categoria: e.target.value})}>
                <option value="">-- Seleccionar Categoría --</option>
                {categorias.map(c => (
                  <option key={c.ID_Categoria} value={c.ID_Categoria}>{c.Nombre_Categoria}</option>
                ))}
              </select>
              
              <label className="small text-muted fw-bold mb-1">Visibilidad en catálogo</label>
              <select className="form-select mb-3" style={inputStyle} value={form.Activo_Catalogo} onChange={e => setForm({...form, Activo_Catalogo: Number(e.target.value)})}>
                <option value={1}>Visible en Catálogo</option>
                <option value={0}>Oculto del Catálogo</option>
              </select>
              
              <button className="btn w-100 btn-primary" onClick={guardar}>
                {enEdicion ? "Actualizar Producto" : "Guardar Producto"}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          {/* PANEL DERECHO: TABLA */}
          <div className="col-lg-8 col-12">
            <div className="card shadow-sm overflow-hidden">
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Buscar por código, nombre o descripción..."
                  value={busqueda} 
                  onChange={e => setBusqueda(e.target.value)} 
                  style={inputStyle}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Cod</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.filter(p =>
                      String(p.Codigo_Producto).toLowerCase().includes(busqueda.toLowerCase()) ||
                      String(p.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                      String(p.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
                    ).map(p => (
                      <tr key={p.Codigo_Producto} className="stagger-item">
                        <td>{p.Codigo_Producto}</td>
                        <td className="fw-bold">{p.Nombre}</td>
                        <td><span className="badge bg-primary">{nombreCategoria(p.ID_Categoria)}</span></td>
                        <td>{p.Cantidad}</td>
                        <td className="text-success fw-bold">${p.Precio}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => { setForm({...p, ID_Categoria: String(p.ID_Categoria)}); setEnEdicion(true); }}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(p.Codigo_Producto)}>Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ LATERAL */}
      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Menú de Navegación</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <Sidebar setVista={setVista} />
      </div>
    </div>
  );
};

export default Productos;