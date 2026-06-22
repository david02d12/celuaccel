import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const IconBox = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

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
    api.get('/categorias/listar').then(res => setCategorias(res.data)).catch(() => {});
  }, []);

  const listar = async () => {
    try {
      const res = await api.get('/productos/listar');
      setProductos(res.data);
    } catch { mostrarToast('Error al cargar productos.', false); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/productos/${url}`, form);
      mostrarToast(enEdicion ? 'Producto actualizado.' : 'Producto registrado en el inventario.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar el producto.', false); }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar este producto del inventario?')) {
      try {
        await api.delete(`/productos/eliminar/${id}`);
        mostrarToast('Producto eliminado.'); listar();
      } catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Producto: '', Cantidad: '', Precio: '', Nombre: '', Descripcion: '', Imagen: '', Activo_Catalogo: 1, ID_Categoria: '' });
    setEnEdicion(false);
  };

  const nombreCategoria = (id) =>
    categorias.find(c => String(c.ID_Categoria) === String(id))?.Nombre_Categoria || '—';

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  const filtrados = productos.filter(p =>
    String(p.Codigo_Producto).toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalActivos = productos.filter(p => p.Activo_Catalogo === 1 || p.Activo_Catalogo === '1').length;

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
        {/* BANNER */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Inventario de Productos</h4>
            <p className="mb-0 opacity-75">Controla el stock, precios y visibilidad en el catalogo</p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="badge bg-white text-danger fw-bold">{productos.length} productos</span>
            <span className="badge fw-bold" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {totalActivos} en catalogo
            </span>
          </div>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ width: 4, height: 20, background: 'var(--color-primary)', borderRadius: 2, display: 'inline-block' }}/>
                <h5 className="mb-0 fw-bold">{enEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h5>
              </div>
              <input className="form-control mb-2" style={inputStyle} placeholder="Codigo del producto"
                value={form.Codigo_Producto} disabled={enEdicion}
                onChange={e => setForm({...form, Codigo_Producto: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="Nombre del producto"
                value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} />
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <input className="form-control" style={inputStyle} type="number" placeholder="Cantidad"
                    value={form.Cantidad} onChange={e => setForm({...form, Cantidad: e.target.value})} />
                </div>
                <div className="col-6">
                  <input className="form-control" style={inputStyle} type="number" placeholder="Precio ($)"
                    value={form.Precio} onChange={e => setForm({...form, Precio: e.target.value})} />
                </div>
              </div>
              <input className="form-control mb-2" style={inputStyle} placeholder="Descripcion del producto"
                value={form.Descripcion} onChange={e => setForm({...form, Descripcion: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="URL de imagen (opcional)"
                value={form.Imagen} onChange={e => setForm({...form, Imagen: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Categoria</label>
              <select className="form-select mb-2" style={inputStyle} value={form.ID_Categoria}
                onChange={e => setForm({...form, ID_Categoria: e.target.value})}>
                <option value="">-- Seleccionar Categoria --</option>
                {categorias.map(c => (
                  <option key={c.ID_Categoria} value={c.ID_Categoria}>{c.Nombre_Categoria}</option>
                ))}
              </select>
              <label className="small text-muted fw-bold mb-1">Visibilidad en catalogo</label>
              <select className="form-select mb-3" style={inputStyle} value={form.Activo_Catalogo}
                onChange={e => setForm({...form, Activo_Catalogo: Number(e.target.value)})}>
                <option value={1}>Visible en Catalogo</option>
                <option value={0}>Oculto del Catalogo</option>
              </select>
              <button className="btn w-100 btn-primary fw-bold" onClick={guardar}>
                {enEdicion ? 'Actualizar Producto' : 'Guardar Producto'}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          {/* CARDS DE PRODUCTOS */}
          <div className="col-lg-8 col-12">
            <div className="mb-3">
              <input type="text" className="form-control" style={inputStyle}
                placeholder="Buscar por codigo, nombre o descripcion..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>

            {filtrados.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted fw-semibold mt-3">No se encontraron productos.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filtrados.map(p => {
                  const activo = p.Activo_Catalogo === 1 || p.Activo_Catalogo === '1';
                  const stockBajo = Number(p.Cantidad) <= 3;
                  return (
                    <div key={p.Codigo_Producto} className="card border-0 shadow-sm fade-in"
                      style={{
                        borderLeft: `4px solid ${activo ? 'var(--color-primary)' : '#6c757d'}`,
                        borderRadius: 12, overflow: 'hidden'
                      }}>
                      <div className="card-body p-3">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                              style={{ width: 36, height: 36, backgroundColor: activo ? 'var(--color-primary-lt)' : '#6c757d20', color: activo ? 'var(--color-primary)' : '#6c757d' }}>
                              <IconBox />
                            </div>
                            <div>
                              <span className="fw-bold" style={{ fontSize: '0.92rem' }}>{p.Nombre}</span>
                              <span className="text-muted ms-2" style={{ fontSize: '0.78rem' }}>#{p.Codigo_Producto}</span>
                            </div>
                          </div>
                          <div className="d-flex gap-1 align-items-center">
                            <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'} d-flex align-items-center gap-1`}
                              style={{ fontSize: '0.7rem' }}>
                              {activo ? <IconEye /> : <IconEyeOff />}
                              {activo ? 'En Catalogo' : 'Oculto'}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="row g-2 mb-2" style={{ fontSize: '0.84rem' }}>
                          <div className="col-4">
                            <span className="text-muted d-block">Categoria</span>
                            <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>
                              {nombreCategoria(p.ID_Categoria)}
                            </span>
                          </div>
                          <div className="col-4">
                            <span className="text-muted d-block">Stock</span>
                            <strong style={{ color: stockBajo ? '#DB0000' : 'inherit' }}>
                              {p.Cantidad} uds
                              {stockBajo && <span className="ms-1" style={{ fontSize: '0.7rem', color: '#DB0000' }}>(bajo)</span>}
                            </strong>
                          </div>
                          <div className="col-4 text-end">
                            <span className="text-muted d-block">Precio</span>
                            <strong style={{ color: '#198754', fontSize: '1rem' }}>${p.Precio}</strong>
                          </div>
                          {p.Descripcion && (
                            <div className="col-12">
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>{p.Descripcion}</span>
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.77rem' }}
                            onClick={() => { setForm({...p, ID_Categoria: String(p.ID_Categoria)}); setEnEdicion(true); }}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.77rem' }}
                            onClick={() => eliminar(p.Codigo_Producto)}>
                            Borrar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Menu de Navegacion</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <Sidebar setVista={setVista} />
      </div>
    </div>
  );
};

export default Productos;