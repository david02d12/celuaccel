import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import { getLimitesGeneralesFecha } from '../../utils/validaciones';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const IconReply = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
  </svg>
);

/* ── Modal genérico ─────────────────────────────────────────────────────── */
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

/* ── Fila de detalle (solo lectura) ─────────────────────────────────────── */
const FilaDetalle = ({ label, children }) => (
  <div style={{ display:'flex',gap:'12px',padding:'10px 0',borderBottom:'1px solid var(--color-border,#333)',alignItems:'flex-start' }}>
    <span style={{ minWidth:140,fontWeight:700,color:'var(--color-text)',fontSize:'0.88rem' }}>{label}</span>
    <span style={{ color:'var(--color-text)',fontSize:'0.88rem',flex:1 }}>{children}</span>
  </div>
);

const Preguntas = ({ cerrarSesion, setVista }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const [respLocal, setRespLocal] = useState('');  // respuesta editable en modal detalle
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const { minDate, maxDate } = getLimitesGeneralesFecha();
  const [form, setForm] = useState({ ID_Consulta: '', ID_Usuario: '', Codigo_Producto: '', Pregunta: '', Fecha: '', Respuesta: '' });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3000);
  };

  const preguntasFiltradas = preguntas.filter(p =>
    String(p.ID_Consulta).includes(busqueda) ||
    String(p.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Codigo_Producto || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Pregunta || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Respuesta || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Fecha || '').includes(busqueda)
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(preguntasFiltradas, 10);

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const [pregRes, prodRes, usuRes] = await Promise.all([
        api.get('/preguntas/listar'),
        api.get('/productos/listar'),
        api.get('/usuarios/listar')
      ]);
      setPreguntas(pregRes.data);
      setProductos(prodRes.data);
      setUsuarios(usuRes.data);
    } catch { mostrarToast('Error al cargar preguntas.', false); }
  };

  const guardar = async () => {
    try {
      if (enEdicion) {
        await api.put(`/preguntas/responder/${form.ID_Consulta}`, { Respuesta: form.Respuesta });
      } else {
        await api.post('/preguntas/agregar', form);
      }
      mostrarToast(enEdicion ? 'Respuesta guardada.' : 'Consulta registrada.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar la pregunta.', false); }
  };

  const eliminar = async (id) => {
    if (await confirmar('¿Eliminar pregunta?')) {
      try {
        await api.delete(`/preguntas/eliminar/${id}`);
        mostrarToast('Pregunta eliminada.'); listar();
      } catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => {
    setForm({ ID_Consulta: '', ID_Usuario: '', Codigo_Producto: '', Pregunta: '', Fecha: '', Respuesta: '' });
    setEnEdicion(false); setModalAbierto(false);
  };

  const abrirNuevo = () => {
    setForm({ ID_Consulta: '', ID_Usuario: '', Codigo_Producto: '', Pregunta: '', Fecha: '', Respuesta: '' });
    setEnEdicion(false); setModalAbierto(true);
  };

  const abrirEdicion = (p) => {
    setForm({ ...p, Fecha: p.Fecha ? p.Fecha.split('T')[0] : '', Respuesta: p.Respuesta || '' });
    setEnEdicion(true); setDetalleItem(null); setModalAbierto(true);
  };

  const abrirDetalle = (p) => { setDetalleItem(p); setRespLocal(p.Respuesta || ''); };

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  const nombreUsuario = (id) => { const u = usuarios.find(u => String(u.ID_Usuario) === String(id)); return u ? u.Nombre : '—'; };
  const nombreProducto = (cod) => { if (!cod) return 'Ninguno'; const p = productos.find(p => String(p.Codigo_Producto) === String(cod)); return p ? p.Nombre : '—'; };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '260px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      {/* MODAL */}
      {detalleItem && (() => {
        const respondida = !!detalleItem.Respuesta;
        return (
          <ModalOverlay titulo={`Consulta #${detalleItem.ID_Consulta}`} onClose={() => setDetalleItem(null)}>
            {/* Estado visible arriba */}
            <div className="text-center mb-3">
              <span className={`badge px-3 py-2 fs-6 ${respondida ? 'bg-success' : 'bg-warning text-dark'}`}>
                {respondida ? '✔ Respondida' : '⏳ Pendiente de respuesta'}
              </span>
            </div>
            <FilaDetalle label="ID Consulta">{detalleItem.ID_Consulta}</FilaDetalle>
            <FilaDetalle label="Documento">{detalleItem.ID_Usuario}</FilaDetalle>
            <FilaDetalle label="Cliente">{nombreUsuario(detalleItem.ID_Usuario)}</FilaDetalle>
            <FilaDetalle label="Cód. Producto">{detalleItem.Codigo_Producto || 'Ninguno'}</FilaDetalle>
            <FilaDetalle label="Producto">{nombreProducto(detalleItem.Codigo_Producto)}</FilaDetalle>
            <FilaDetalle label="Pregunta"><em>{detalleItem.Pregunta}</em></FilaDetalle>
            {respondida && <FilaDetalle label="Respuesta actual"><span style={{ color:'var(--color-primary)', fontStyle:'italic' }}>{detalleItem.Respuesta}</span></FilaDetalle>}
            <div className="mt-3">
              <label className="small fw-bold mb-1" style={{ color:'var(--color-primary)' }}>
                {respondida ? 'Actualizar respuesta:' : 'Escribe tu respuesta:'}
              </label>
              <textarea className="form-control mt-1" style={inputStyle} rows={3}
                placeholder="Escribe la respuesta al cliente..."
                value={respLocal} onChange={e => setRespLocal(e.target.value)} />
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetalleItem(null)}>Cerrar</button>
              <button className="btn btn-outline-primary" style={{ flex:1 }}
                onClick={async () => {
                  if (!respLocal.trim()) return;
                  try {
                    await api.put(`/preguntas/responder/${detalleItem.ID_Consulta}`, { Respuesta: respLocal });
                    mostrarToast('Respuesta guardada.');
                    setDetalleItem(null); listar();
                  } catch { mostrarToast('Error al guardar.', false); }
                }}>✉️ Responder</button>
              <button className="btn" style={{ flex:1, background:'#dc3545', color:'#fff', border:'none' }}
                onClick={async () => { setDetalleItem(null); await eliminar(detalleItem.ID_Consulta); }}>🗑 Eliminar</button>
            </div>
          </ModalOverlay>
        );
      })()}

      {modalAbierto && (
        <ModalOverlay titulo={enEdicion ? 'Responder Consulta' : 'Nueva Consulta'} onClose={limpiar}>
          {enEdicion ? (
            <>
              <FilaDetalle label="ID Consulta">{form.ID_Consulta}</FilaDetalle>
              <FilaDetalle label="Documento">{form.ID_Usuario}</FilaDetalle>
              <FilaDetalle label="Cliente">{nombreUsuario(form.ID_Usuario)}</FilaDetalle>
              <FilaDetalle label="Código Producto">{form.Codigo_Producto || 'Ninguno'}</FilaDetalle>
              <FilaDetalle label="Producto">{nombreProducto(form.Codigo_Producto)}</FilaDetalle>
              <FilaDetalle label="Pregunta">{form.Pregunta}</FilaDetalle>
              <div style={{ marginTop: 16 }}>
                <label className="small fw-bold mb-1" style={{ color: 'var(--color-primary)' }}>Respuesta del Técnico</label>
                <textarea className="form-control mt-1" style={inputStyle} rows={4}
                  placeholder="Escribe tu respuesta al cliente..."
                  value={form.Respuesta}
                  onChange={e => setForm({ ...form, Respuesta: e.target.value })} />
              </div>
            </>
          ) : (
            <>
              <div className="mb-2">
                <label className="small text-muted fw-bold mb-1">ID Consulta</label>
                <input className="form-control" style={inputStyle} type="number" placeholder="ID Consulta"
                  value={form.ID_Consulta} onChange={e => setForm({ ...form, ID_Consulta: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="small text-muted fw-bold mb-1">ID Usuario</label>
                <input className="form-control" style={inputStyle} placeholder="ID Usuario"
                  value={form.ID_Usuario} onChange={e => setForm({ ...form, ID_Usuario: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="small text-muted fw-bold mb-1">Código Producto</label>
                <input className="form-control" style={inputStyle} placeholder="Cód. Producto (opcional)"
                  value={form.Codigo_Producto} onChange={e => setForm({ ...form, Codigo_Producto: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="small text-muted fw-bold mb-1">Pregunta</label>
                <textarea className="form-control" style={inputStyle} rows={3}
                  value={form.Pregunta} onChange={e => setForm({ ...form, Pregunta: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="small text-muted fw-bold mb-1">Fecha</label>
                <input className="form-control" style={inputStyle} type="date" min={minDate} max={maxDate}
                  value={form.Fecha} onChange={e => setForm({ ...form, Fecha: e.target.value })} />
              </div>
            </>
          )}
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn btn-primary fw-bold" style={{ flex: 1, background: 'var(--color-primary)', border: 'none' }} onClick={guardar}>
              {enEdicion ? 'Guardar Respuesta' : 'Guardar'}
            </button>
          </div>
        </ModalOverlay>
      )}

      <Navbar titulo="CELUACCEL — Preguntas de Clientes" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Preguntas sobre Equipos</h4>
            <p className="mb-0 opacity-75">Responde las inquietudes técnicas de los clientes sobre los productos</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-danger fw-bold fs-6" style={{ backgroundColor: '#fff' }}>{preguntas.length} preguntas</span>
            <button className="btn btn-sm fw-bold" style={{ background: '#fff', color: 'var(--color-primary)', borderRadius: '8px', padding: '6px 14px' }} onClick={abrirNuevo}>
              + Nueva consulta
            </button>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="mb-3">
          <input type="text" className="form-control" style={inputStyle}
            placeholder="Buscar por usuario, producto, pregunta, respuesta o fecha..."
            value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
        </div>

        {/* TABLA */}
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
               <thead>
                <tr>
                  <th>ID</th>
                  <th>Doc.</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Pregunta (resumen)</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {datosPagina.map(p => (
                  <tr key={p.ID_Consulta} className="stagger-item">
                    <td>{p.ID_Consulta}</td>
                    <td className="text-muted small">{p.ID_Usuario}</td>
                    <td className="fw-bold">{nombreUsuario(p.ID_Usuario)}</td>
                    <td>
                      <div className="fw-bold" style={{ color:'var(--color-primary)', fontSize:'0.85rem' }}>{nombreProducto(p.Codigo_Producto)}</div>
                      {p.Codigo_Producto && <div className="text-muted" style={{ fontSize:'0.72rem' }}>#{p.Codigo_Producto}</div>}
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <div style={{ fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:170 }} title={p.Pregunta}>{p.Pregunta}</div>
                    </td>
                     <td>
                       <span className={`badge ${p.Respuesta ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.7rem' }}>
                         {p.Respuesta ? '✔ Respondida' : '⏳ Pendiente'}
                       </span>
                     </td>
                     <td>
                       <button className="btn btn-sm fw-bold" style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.77rem' }}
                         onClick={() => abrirDetalle(p)}>Ver más</button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3">
            <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
          </div>
        </div>
      </div>

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

export default Preguntas;