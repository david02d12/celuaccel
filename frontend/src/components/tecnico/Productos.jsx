import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
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

const ModalOverlay = ({ titulo, onClose, children }) => (
  <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
    <div style={{ background:'var(--color-surface,#1e1e1e)',borderRadius:12,width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
      <div style={{ background:'var(--color-primary,#DB0000)',borderRadius:'12px 12px 0 0',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ color:'#fff',fontWeight:700,fontSize:'1.05rem' }}>{titulo}</span>
        <button onClick={onClose} style={{ background:'transparent',border:'none',color:'#fff',fontSize:'1.3rem',lineHeight:1,cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ padding:'20px' }}>{children}</div>
    </div>
  </div>
);

const Fila = ({ label, children }) => (
  <div style={{ display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--color-border,#333)',alignItems:'flex-start' }}>
    <span style={{ minWidth:130,fontWeight:700,fontSize:'0.88rem',color:'var(--color-text)' }}>{label}</span>
    <span style={{ color:'var(--color-text)',fontSize:'0.88rem',flex:1 }}>{children}</span>
  </div>
);

const Productos = ({ cerrarSesion, setVista }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const [form, setForm] = useState({
    Codigo_Producto: '', Cantidad: '', Precio: '', Precio_Compra: '', Nombre: '',
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
    try { const res = await api.get('/productos/listar'); setProductos(res.data); }
    catch { mostrarToast('Error al cargar productos.', false); }
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
    if (await confirmar('¿Eliminar este producto del inventario?')) {
      try { await api.delete(`/productos/eliminar/${id}`); mostrarToast('Producto eliminado.'); listar(); }
      catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Producto: '', Cantidad: '', Precio: '', Precio_Compra: '', Nombre: '', Descripcion: '', Imagen: '', Activo_Catalogo: 1, ID_Categoria: '' });
    setEnEdicion(false); setModalAbierto(false);
  };

  const abrirNuevo = () => { limpiar(); setModalAbierto(true); };
  const abrirEdicion = (p) => { setForm({...p, ID_Categoria: String(p.ID_Categoria)}); setEnEdicion(true); setDetalleItem(null); setModalAbierto(true); };
  const abrirDetalle = (p) => setDetalleItem(p);

  const nombreCategoria = (id) => categorias.find(c => String(c.ID_Categoria) === String(id))?.Nombre_Categoria || '—';
  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  const filtrados = productos.filter(p =>
    String(p.Codigo_Producto).toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Precio || '').includes(busqueda)
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

      {/* MODAL DETALLE */}
      {detalleItem && (() => {
        const activo = detalleItem.Activo_Catalogo === 1 || detalleItem.Activo_Catalogo === '1';
        const stockBajo = Number(detalleItem.Cantidad) <= 3;
        return (
          <ModalOverlay titulo={detalleItem.Nombre} onClose={() => setDetalleItem(null)}>
            <Fila label="Código">{detalleItem.Codigo_Producto}</Fila>
            <Fila label="Categoría">{nombreCategoria(detalleItem.ID_Categoria)}</Fila>
            <Fila label="Precio"><strong style={{ color:'#198754',fontSize:'1.1rem' }}>${Number(detalleItem.Precio).toLocaleString()}</strong></Fila>
            {detalleItem.Precio_Compra != null && <Fila label="Costo">${Number(detalleItem.Precio_Compra).toLocaleString()}</Fila>}
            <Fila label="Stock">
              <span style={{ color: stockBajo ? '#dc3545' : 'inherit', fontWeight: 700 }}>
                {detalleItem.Cantidad} unidades{stockBajo && <span className="ms-1 badge bg-danger">Stock bajo</span>}
              </span>
            </Fila>
            <Fila label="Disponibilidad">
              <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'}`}>{activo ? 'En Catálogo' : 'Oculto'}</span>
            </Fila>
            {detalleItem.Descripcion && <Fila label="Descripción">{detalleItem.Descripcion}</Fila>}
            {detalleItem.Imagen && (
              <Fila label="Imagen">
                <img src={detalleItem.Imagen} alt={detalleItem.Nombre}
                  style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginTop: 4 }}
                  onError={e => { e.target.style.display = 'none'; }} />
              </Fila>
            )}
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetalleItem(null)}>Cerrar</button>
              <button className="btn btn-outline-secondary" style={{ flex:1 }} onClick={() => abrirEdicion(detalleItem)}>✏️ Editar</button>
              <button className="btn" style={{ flex:1, background:'#dc3545', color:'#fff', border:'none' }}
                onClick={async () => { setDetalleItem(null); await eliminar(detalleItem.Codigo_Producto); }}>🗑 Eliminar</button>
            </div>
          </ModalOverlay>
        );
      })()}

      {/* MODAL FORMULARIO */}
      {modalAbierto && (
        <ModalOverlay titulo={enEdicion ? 'Editar Producto' : 'Nuevo Producto'} onClose={limpiar}>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Código del Producto</label>
            <input className="form-control" style={inputStyle} placeholder="Codigo del producto"
              value={form.Codigo_Producto} disabled={enEdicion}
              onChange={e => setForm({...form, Codigo_Producto: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Nombre</label>
            <input className="form-control" style={inputStyle} placeholder="Nombre del producto"
              value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} />
          </div>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <label className="small text-muted fw-bold mb-1">Cantidad Inicial</label>
              <input className="form-control" style={inputStyle} type="number" min="0" placeholder="Cantidad"
                value={form.Cantidad} disabled={enEdicion}
                onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setForm({...form, Cantidad: v}); }} />
            </div>
            <div className="col-6">
              <label className="small text-muted fw-bold mb-1">Precio ($)</label>
              <input className="form-control" style={inputStyle} type="number" min="0" placeholder="Precio"
                value={form.Precio}
                onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setForm({...form, Precio: v}); }} />
            </div>
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Precio de Compra ($) (opcional)</label>
            <input className="form-control" style={inputStyle} type="number" min="0" placeholder="Precio de compra"
              value={form.Precio_Compra === null || form.Precio_Compra === undefined ? '' : form.Precio_Compra}
              onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setForm({...form, Precio_Compra: v}); }} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Descripción</label>
            <input className="form-control" style={inputStyle} placeholder="Descripcion del producto"
              value={form.Descripcion} onChange={e => setForm({...form, Descripcion: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">URL Imagen (opcional)</label>
            <input className="form-control" style={inputStyle} placeholder="URL de imagen"
              value={form.Imagen} onChange={e => setForm({...form, Imagen: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Categoría</label>
            <select className="form-select" style={inputStyle} value={form.ID_Categoria}
              onChange={e => setForm({...form, ID_Categoria: e.target.value})}>
              <option value="">-- Seleccionar Categoría --</option>
              {categorias.map(c => (<option key={c.ID_Categoria} value={c.ID_Categoria}>{c.Nombre_Categoria}</option>))}
            </select>
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Visibilidad en catálogo</label>
            <select className="form-select" style={inputStyle} value={form.Activo_Catalogo}
              onChange={e => setForm({...form, Activo_Catalogo: Number(e.target.value)})}>
              <option value={1}>Visible en Catálogo</option>
              <option value={0}>Oculto del Catálogo</option>
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-secondary" style={{ flex:1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn fw-bold" style={{ flex:1, background:'var(--color-primary)', color:'#fff', border:'none' }} onClick={guardar}>
              {enEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </ModalOverlay>
      )}

      <Navbar titulo="CELUACCEL — Inventario de Productos" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <nav aria-label="breadcrumb" className="mb-3 fade-in-up">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
            <li className="breadcrumb-item">
              <a href="#" className="text-decoration-none text-muted" onClick={e => { e.preventDefault(); setVista('home'); }}>Inicio</a>
            </li>
            <li className="breadcrumb-item active fw-bold" aria-current="page" style={{ color: 'var(--color-primary)' }}>Inventario de Productos</li>
          </ol>
        </nav>

        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Inventario de Productos</h4>
            <p className="mb-0 opacity-75">Controla el stock, precios y visibilidad en el catalogo</p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="badge text-danger fw-bold" style={{ backgroundColor: '#fff' }}>{productos.length} productos</span>
            <span className="badge fw-bold" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>{totalActivos} en catalogo</span>
            <button className="btn btn-sm fw-bold" style={{ background: '#fff', color: 'var(--color-primary)', borderRadius: '8px', padding: '6px 14px' }} onClick={abrirNuevo}>
              + Nuevo producto
            </button>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="mb-3">
          <input type="text" className="form-control" style={inputStyle}
            placeholder=" Buscar por código, nombre, descripción, precio o categoría..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        {/* GRID DE PRODUCTOS */}
        {filtrados.length === 0 ? (
          <div className="text-center py-5 fade-in border rounded shadow-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <h5 className="fw-bold mb-2 text-muted">Aún no hay productos</h5>
            <p className="text-muted small mb-4">No encontramos productos que coincidan con tu búsqueda.</p>
            <button className="btn btn-outline-primary fw-bold" onClick={abrirNuevo}>¡Agregar el primero!</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem' }}>
            {filtrados.map(p => {
              const activo = p.Activo_Catalogo === 1 || p.Activo_Catalogo === '1';
              const stockBajo = Number(p.Cantidad) <= 3;
              return (
                <div key={p.Codigo_Producto} className="card border-0 shadow-sm fade-in"
                  style={{ borderLeft: `4px solid ${activo ? 'var(--color-primary)' : '#6c757d'}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{ width: 36, height: 36, backgroundColor: activo ? 'var(--color-primary-lt)' : '#6c757d20', color: activo ? 'var(--color-primary)' : '#6c757d' }}>
                          <IconBox />
                        </div>
                        <div>
                          <span className="fw-bold d-block" style={{ fontSize: '0.92rem' }}>{p.Nombre}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>#{p.Codigo_Producto}</span>
                        </div>
                      </div>
                      <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'} d-flex align-items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                        {activo ? <IconEye /> : <IconEyeOff />}{activo ? 'En Catálogo' : 'Oculto'}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize:'0.83rem' }}>
                      <span className="badge bg-primary" style={{ fontSize:'0.7rem' }}>{nombreCategoria(p.ID_Categoria)}</span>
                      <span style={{ color: stockBajo ? '#dc3545' : 'inherit', fontWeight:600 }}>{p.Cantidad} uds{stockBajo && <span className="ms-1 badge bg-danger" style={{fontSize:'0.65rem'}}>bajo</span>}</span>
                      <strong style={{ color: '#198754', fontSize: '1rem' }}>${Number(p.Precio).toLocaleString()}</strong>
                    </div>

                    {p.Descripcion && <p className="text-muted small mb-2" style={{ fontSize:'0.78rem', lineHeight:1.4 }}>{p.Descripcion}</p>}

                    <button className="btn btn-sm fw-bold w-100 mt-1" style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.8rem' }}
                      onClick={() => abrirDetalle(p)}>Ver más</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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