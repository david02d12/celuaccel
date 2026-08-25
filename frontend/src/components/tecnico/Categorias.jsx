import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

/* ── Paleta de colores rica ──────────────────────────────────── */
const PALETTE = [
  { bg: '#DB0000', light: '#ffeaea' },
  { bg: '#0d6efd', light: '#e8f0ff' },
  { bg: '#198754', light: '#e6f4ee' },
  { bg: '#f59e0b', light: '#fff8e1' },
  { bg: '#8b5cf6', light: '#f0ebff' },
  { bg: '#0dcaf0', light: '#e0f9ff' },
  { bg: '#fd7e14', light: '#fff3e0' },
  { bg: '#20c997', light: '#e0faf3' },
  { bg: '#d63384', light: '#ffe0f0' },
  { bg: '#6610f2', light: '#ede0ff' },
];

/* ── Iconos por nombre de categoría ─────────────────────────── */
const getEmoji = (nombre = '') => {
  const n = nombre.toLowerCase();
  if (n.includes('acces')) return '🎧';
  if (n.includes('bater') || n.includes('energ')) return '🔋';
  if (n.includes('celul') || n.includes('movil') || n.includes('móvil')) return '📱';
  if (n.includes('repuest')) return '🔧';
  if (n.includes('audio') || n.includes('son')) return '🎵';
  if (n.includes('funda') || n.includes('case') || n.includes('protec')) return '🛡️';
  if (n.includes('carg') || n.includes('cable')) return '⚡';
  if (n.includes('cam') || n.includes('foto')) return '📷';
  if (n.includes('pantall') || n.includes('display')) return '🖥️';
  return '🏷️';
};

/* ── Modal genérico ──────────────────────────────────────────── */
const ModalOverlay = ({ titulo, colorHeader, onClose, children }) => (
  <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
    <div style={{ background:'var(--color-surface,#1e1e1e)',borderRadius:16,width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 12px 50px rgba(0,0,0,0.55)' }}>
      <div style={{ background: colorHeader || 'var(--color-primary,#DB0000)', borderRadius:'16px 16px 0 0', padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'#fff', fontWeight:700, fontSize:'1.08rem' }}>{titulo}</span>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', fontSize:'1.1rem', lineHeight:1, cursor:'pointer', borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
      </div>
      <div style={{ padding:'22px' }}>{children}</div>
    </div>
  </div>
);

const Fila = ({ label, children }) => (
  <div style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--color-border,#333)', alignItems:'flex-start' }}>
    <span style={{ minWidth:130, fontWeight:700, fontSize:'0.86rem', color:'var(--color-text)', flexShrink:0 }}>{label}</span>
    <span style={{ color:'var(--color-text)', fontSize:'0.86rem', flex:1 }}>{children}</span>
  </div>
);

const Categorias = ({ cerrarSesion, setVista }) => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [form, setForm] = useState({ ID_Categoria: '', Nombre_Categoria: '' });

  const categoriasFiltradas = categorias.filter(c =>
    String(c.ID_Categoria).includes(busqueda) ||
    String(c.Nombre_Categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(categoriasFiltradas, 12);

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3000);
  };

  useEffect(() => {
    listar();
    api.get('/productos/listar').then(r => setProductos(r.data)).catch(() => {});
  }, []);

  const listar = async () => {
    try { const res = await api.get('/categorias/listar'); setCategorias(res.data); }
    catch { mostrarToast('Error al cargar categorias.', false); }
  };

  const guardar = async () => {
    if (!form.Nombre_Categoria.trim()) return mostrarToast('El nombre es obligatorio.', false);
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/categorias/${url}`, form);
      mostrarToast(enEdicion ? 'Categoria actualizada.' : 'Categoria creada.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar la categoria.', false); }
  };

  const eliminar = async (id) => {
    if (await confirmar('¿Eliminar esta categoria?')) {
      try { await api.delete(`/categorias/eliminar/${id}`); mostrarToast('Categoria eliminada.'); listar(); }
      catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => { setForm({ ID_Categoria: '', Nombre_Categoria: '' }); setEnEdicion(false); setModalAbierto(false); };
  const abrirNuevo = () => { setForm({ ID_Categoria: '', Nombre_Categoria: '' }); setEnEdicion(false); setModalAbierto(true); };
  const abrirEdicion = (c) => { setForm(c); setEnEdicion(true); setDetalleItem(null); setModalAbierto(true); };
  const abrirDetalle = (c) => setDetalleItem(c);

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  /* Contar productos por categoría */
  const contarProductos = (id) => productos.filter(p => String(p.ID_Categoria) === String(id)).length;

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '260px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      {/* ── MODAL DETALLE ── */}
      {detalleItem && (() => {
        const idx = categorias.findIndex(c => c.ID_Categoria === detalleItem.ID_Categoria);
        const pal = PALETTE[((idx >= 0 ? idx : 0)) % PALETTE.length];
        const emoji = getEmoji(detalleItem.Nombre_Categoria);
        const nProd = contarProductos(detalleItem.ID_Categoria);
        return (
          <ModalOverlay titulo={detalleItem.Nombre_Categoria} colorHeader={pal.bg} onClose={() => setDetalleItem(null)}>
            {/* Hero visual */}
            <div className="text-center mb-4" style={{ padding:'20px 0 10px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:80, height:80, borderRadius:'50%', background: pal.bg + '22', fontSize:'2.4rem', marginBottom:12 }}>
                {emoji}
              </div>
              <div className="fw-bold" style={{ fontSize:'1.2rem', color:'var(--color-text)' }}>{detalleItem.Nombre_Categoria}</div>
              <div className="mt-1">
                <span className="badge" style={{ backgroundColor: pal.bg, fontSize:'0.8rem' }}>#{detalleItem.ID_Categoria}</span>
                <span className="badge ms-2" style={{ backgroundColor:'var(--color-border)', color:'var(--color-text)', fontSize:'0.8rem' }}>
                  {nProd} {nProd === 1 ? 'producto' : 'productos'}
                </span>
              </div>
            </div>
            <Fila label="ID Categoría">#{detalleItem.ID_Categoria}</Fila>
            <Fila label="Nombre">{detalleItem.Nombre_Categoria}</Fila>
            <Fila label="Productos asociados">
              <span style={{ color: nProd > 0 ? '#198754' : 'var(--color-text-muted)', fontWeight:700 }}>
                {nProd > 0 ? `${nProd} producto${nProd > 1 ? 's' : ''} en inventario` : 'Sin productos aún'}
              </span>
            </Fila>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetalleItem(null)}>Cerrar</button>
              <button className="btn btn-outline-secondary" style={{ flex:1 }} onClick={() => abrirEdicion(detalleItem)}>✏️ Editar</button>
              <button className="btn" style={{ flex:1, background:'#dc3545', color:'#fff', border:'none' }}
                onClick={async () => { setDetalleItem(null); await eliminar(detalleItem.ID_Categoria); }}>🗑 Eliminar</button>
            </div>
          </ModalOverlay>
        );
      })()}

      {/* ── MODAL FORMULARIO ── */}
      {modalAbierto && (
        <ModalOverlay titulo={enEdicion ? 'Editar Categoría' : 'Nueva Categoría'} onClose={limpiar}>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">ID Categoría</label>
            <input className="form-control" style={inputStyle} type="number"
              placeholder="ID Categoría" value={form.ID_Categoria} disabled={enEdicion}
              onChange={e => setForm({...form, ID_Categoria: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Nombre</label>
            <input className="form-control" style={inputStyle}
              placeholder="Nombre de la Categoría" value={form.Nombre_Categoria}
              onChange={e => setForm({...form, Nombre_Categoria: e.target.value})} />
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-secondary" style={{ flex:1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn fw-bold" style={{ flex:1, background:'var(--color-primary)', color:'#fff', border:'none' }} onClick={guardar}>
              {enEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </ModalOverlay>
      )}

      <Navbar titulo="CELUACCEL — Categorias de Sistema" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Categorías de Productos</h4>
            <p className="mb-0 opacity-75">Define y edita las categorías del catálogo</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-danger fw-bold fs-6" style={{ backgroundColor: '#fff' }}>{categorias.length} categorías</span>
            <button className="btn btn-sm fw-bold" style={{ background:'#fff', color:'var(--color-primary)', borderRadius:'8px', padding:'6px 14px' }} onClick={abrirNuevo}>
              + Nueva categoría
            </button>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="mb-4">
          <input type="text" className="form-control" style={inputStyle}
            placeholder="Buscar categoría por nombre o ID..."
            value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
        </div>

        {/* GRID DE TARJETAS VISUALES */}
        {categoriasFiltradas.length === 0 ? (
          <div className="text-center py-5 rounded border" style={{ borderColor:'var(--color-border)', backgroundColor:'var(--color-surface)' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>🏷️</div>
            <p className="fw-semibold text-muted">No se encontraron categorías</p>
            <button className="btn fw-bold mt-2" style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:8 }} onClick={abrirNuevo}>+ Crear la primera</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'1rem' }}>
            {datosPagina.map((c, idx) => {
              const pal = PALETTE[idx % PALETTE.length];
              const emoji = getEmoji(c.Nombre_Categoria);
              const nProd = contarProductos(c.ID_Categoria);
              const inicial = (c.Nombre_Categoria || '#')[0].toUpperCase();
              return (
                <div key={c.ID_Categoria} className="card border-0 shadow-sm fade-in"
                  style={{ borderRadius:14, overflow:'hidden', cursor:'pointer', transition:'transform 0.18s, box-shadow 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${pal.bg}33`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>

                  {/* Cabecera de color */}
                  <div style={{ background: `linear-gradient(135deg, ${pal.bg}, ${pal.bg}cc)`, padding:'24px 16px 16px', textAlign:'center', position:'relative' }}>
                    {/* Círculo decorativo fondo */}
                    <div style={{ position:'absolute', top:-18, right:-18, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
                    {/* Emoji / Inicial */}
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.22)', fontSize:'1.8rem', marginBottom:8 }}>
                      {emoji}
                    </div>
                    <div className="fw-bold text-white" style={{ fontSize:'1rem', letterSpacing:'0.01em' }}>{c.Nombre_Categoria}</div>
                    <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.75rem', marginTop:2 }}>ID #{c.ID_Categoria}</div>
                  </div>

                  {/* Cuerpo */}
                  <div className="card-body px-3 py-2" style={{ background:'var(--color-surface)' }}>
                    {/* Contador de productos */}
                    <div className="d-flex align-items-center justify-content-between mb-2 pt-1">
                      <span style={{ fontSize:'0.78rem', color:'var(--color-text-muted)' }}>Productos</span>
                      <span className="fw-bold" style={{ fontSize:'1.1rem', color: nProd > 0 ? pal.bg : 'var(--color-text-muted)' }}>
                        {nProd}
                      </span>
                    </div>
                    {/* Barra de relleno proporcional */}
                    <div style={{ height:4, borderRadius:99, background:'var(--color-border)', marginBottom:12, overflow:'hidden' }}>
                      <div style={{ width: nProd > 0 ? `${Math.min(100, nProd * 10)}%` : '0%', height:'100%', background: pal.bg, borderRadius:99, transition:'width 0.6s ease' }} />
                    </div>
                    {/* Botón */}
                    <button className="btn btn-sm fw-bold w-100" style={{ background: pal.bg, color:'#fff', border:'none', borderRadius:8, fontSize:'0.82rem', padding:'6px' }}
                      onClick={() => abrirDetalle(c)}>Ver más</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="mt-4">
            <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
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

export default Categorias;