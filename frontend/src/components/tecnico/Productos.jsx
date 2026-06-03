import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import axios from 'axios';

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

  const config = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => {
    listar();
    axios.get('http://localhost:3000/api/categorias/listar', config())
      .then(res => setCategorias(res.data))
      .catch(() => {});
  }, []);

  const listar = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/productos/listar', config());
      setProductos(res.data);
    } catch (err) { mostrarToast('Error al cargar productos.', false); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await axios[metodo](`http://localhost:3000/api/productos/${url}`, form, config());
      mostrarToast(enEdicion ? 'Producto actualizado correctamente.' : 'Producto registrado en el inventario.');
      listar();
      limpiar();
    } catch (err) { mostrarToast("Error al procesar el producto. Verifica los datos.", false); }
  };

  const eliminar = async (id) => {
    if (window.confirm("¿Eliminar este producto del inventario?")) {
      try {
        await axios.delete(`http://localhost:3000/api/productos/eliminar/${id}`, config());
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

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Inventario de Productos" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 p-4 rounded-3 text-white d-flex justify-content-between align-items-center flex-wrap gap-2"
          style={{ background: 'linear-gradient(135deg, #DB0000, #8B0000)' }}>
          <div>
            <h4 className="fw-bold mb-1">Inventario de Productos</h4>
            <p className="mb-0 opacity-75">Controla el stock, precios y visibilidad en el catálogo</p>
          </div>
          <span className="badge bg-light text-danger fw-bold fs-6">{productos.length} productos</span>
        </div>

        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">{enEdicion ? "Editar Producto" : "Nuevo Producto"}</h5>
              <input className="form-control mb-2" placeholder="Código del producto" value={form.Codigo_Producto} disabled={enEdicion} onChange={e => setForm({...form, Codigo_Producto: e.target.value})} />
              <input className="form-control mb-2" placeholder="Nombre del producto" value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} />
              <input className="form-control mb-2" type="number" placeholder="Cantidad en stock" value={form.Cantidad} onChange={e => setForm({...form, Cantidad: e.target.value})} />
              <input className="form-control mb-2" type="number" placeholder="Precio ($)" value={form.Precio} onChange={e => setForm({...form, Precio: e.target.value})} />
              <input className="form-control mb-2" placeholder="Descripción del producto" value={form.Descripcion} onChange={e => setForm({...form, Descripcion: e.target.value})} />
              <input className="form-control mb-2" placeholder="URL de imagen (opcional)" value={form.Imagen} onChange={e => setForm({...form, Imagen: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Categoría</label>
              <select className="form-select mb-2" value={form.ID_Categoria} onChange={e => setForm({...form, ID_Categoria: e.target.value})}>
                <option value="">-- Seleccionar Categoría --</option>
                {categorias.map(c => (
                  <option key={c.ID_Categoria} value={c.ID_Categoria}>{c.Nombre_Categoria}</option>
                ))}
              </select>
              <label className="small text-muted fw-bold mb-1">Visibilidad en catálogo</label>
              <select className="form-select mb-3" value={form.Activo_Catalogo} onChange={e => setForm({...form, Activo_Catalogo: Number(e.target.value)})}>
                <option value={1}>Visible en Catálogo</option>
                <option value={0}>Oculto del Catálogo</option>
              </select>
              <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={guardar}>
                {enEdicion ? "Actualizar Producto" : "Guardar Producto"}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow-sm overflow-hidden">
              <div className="p-3 border-bottom">
                <input type="text" className="form-control"
                  placeholder="Buscar por código, nombre o descripción..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr><th>Cod</th><th>Nombre</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Acciones</th></tr>
                </thead>
                <tbody className="bg-white">
                  {productos.filter(p =>
                    String(p.Codigo_Producto).toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(p.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(p.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
                  ).map(p => (
                    <tr key={p.Codigo_Producto}>
                      <td>{p.Codigo_Producto}</td>
                      <td className="fw-bold">{p.Nombre}</td>
                      <td><span className="badge" style={{ backgroundColor: '#DB0000' }}>{nombreCategoria(p.ID_Categoria)}</span></td>
                      <td>{p.Cantidad}</td>
                      <td className="text-success fw-bold">${p.Precio}</td>
                      <td>
                        <button className="btn btn-sm me-1 text-white" style={{ backgroundColor: '#121212' }}
                          onClick={() => { setForm({...p, ID_Categoria: String(p.ID_Categoria)}); setEnEdicion(true); }}>
                          Editar
                        </button>
                        <button className="btn btn-sm text-white" style={{ backgroundColor: '#DB0000' }} onClick={() => eliminar(p.Codigo_Producto)}>Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal" style={{ backgroundColor: '#121212' }}>
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