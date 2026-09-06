import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const COLORES_ROL = {
  1: { bg: '#0d6efd', label: 'Tecnico' },
  2: { bg: '#6c757d', label: 'Cliente' },
  3: { bg: '#DB0000', label: 'Administrador' },
};
const ROLES_SISTEMA = [1, 2, 3];
const esRolSistema = (codigo) => ROLES_SISTEMA.includes(Number(codigo));

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ModalOverlay = ({ titulo, onClose, children }) => (
  <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
    <div style={{ background:'var(--color-surface,#1e1e1e)',borderRadius:12,width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
      <div style={{ background:'var(--color-primary,#DB0000)',borderRadius:'12px 12px 0 0',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ color:'#fff',fontWeight:700,fontSize:'1.05rem' }}>{titulo}</span>
        <button onClick={onClose} style={{ background:'transparent',border:'none',color:'#fff',fontSize:'1.3rem',lineHeight:1,cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ padding:'20px' }}>{children}</div>
    </div>
  </div>
);

const Roles = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [form, setForm] = useState({ Codigo_Rol: '', Nombre_Rol: '' });

  const rolesFiltrados = datos.filter(d =>
    String(d.Codigo_Rol).includes(busqueda) ||
    String(d.Nombre_Rol || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(rolesFiltrados, 8);

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3000);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try { const res = await api.get('/roles/listar'); setDatos(res.data); }
    catch { mostrarToast('Error al cargar roles.', false); }
  };

  const guardar = async () => {
    try {
      if (ROLES_SISTEMA.includes(Number(form.Codigo_Rol))) {
        mostrarToast('No puedes crear ni modificar roles del sistema.', false); return;
      }
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/roles/${url}`, form);
      mostrarToast(enEdicion ? 'Rol actualizado.' : 'Rol creado.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar la solicitud.', false); }
  };

  const eliminar = async (id) => {
    if (ROLES_SISTEMA.includes(Number(id))) { mostrarToast('No puedes eliminar roles del sistema.', false); return; }
    if (await confirmar('¿Eliminar este rol?')) {
      try { await api.delete(`/roles/eliminar/${id}`); mostrarToast('Rol eliminado.'); listar(); }
      catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => { setForm({ Codigo_Rol: '', Nombre_Rol: '' }); setEnEdicion(false); setModalAbierto(false); };
  const abrirNuevo = () => { setForm({ Codigo_Rol: '', Nombre_Rol: '' }); setEnEdicion(false); setModalAbierto(true); };
  const abrirEdicion = (d) => { setEnEdicion(true); setForm(d); setDetalleItem(null); setModalAbierto(true); };
  const abrirDetalle = (d) => setDetalleItem(d);

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '260px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      {detalleItem && (
        <ModalOverlay titulo={detalleItem.Nombre_Rol} onClose={() => setDetalleItem(null)}>
          {(() => { const info = COLORES_ROL[detalleItem.Codigo_Rol] || { bg: '#6c757d' }; return (
            <>
              <div style={{ display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--color-border,#333)' }}>
                <span style={{ minWidth:130,fontWeight:700,fontSize:'0.88rem',color:'var(--color-text)' }}>Código</span>
                <span style={{ color:'var(--color-text)',fontSize:'0.88rem' }}>#{detalleItem.Codigo_Rol}</span>
              </div>
              <div style={{ display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--color-border,#333)' }}>
                <span style={{ minWidth:130,fontWeight:700,fontSize:'0.88rem',color:'var(--color-text)' }}>Nombre</span>
                <span style={{ color:'var(--color-text)',fontSize:'0.88rem' }}>{detalleItem.Nombre_Rol}</span>
              </div>
              <div style={{ display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--color-border,#333)' }}>
                <span style={{ minWidth:130,fontWeight:700,fontSize:'0.88rem',color:'var(--color-text)' }}>Estado</span>
                <span>{esRolSistema(detalleItem.Codigo_Rol)
                  ? <span className="badge" style={{ background:'var(--color-border,#444)',color:'var(--color-text-muted,#aaa)',fontSize:'0.78rem' }}>🔒 Protegido</span>
                  : <span className="badge" style={{ background: info.bg,fontSize:'0.78rem' }}>Personalizado</span>}
                </span>
              </div>
              {!esRolSistema(detalleItem.Codigo_Rol) && (
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetalleItem(null)}>Cerrar</button>
                  <button className="btn btn-outline-secondary" style={{ flex:1 }} onClick={() => abrirEdicion(detalleItem)}>✏️ Editar</button>
                  <button className="btn" style={{ flex:1, background:'#dc3545', color:'#fff', border:'none' }} onClick={async () => { setDetalleItem(null); await eliminar(detalleItem.Codigo_Rol); }}>🗑 Eliminar</button>
                </div>
              )}
              {esRolSistema(detalleItem.Codigo_Rol) && (
                <button className="btn btn-secondary w-100 mt-4" onClick={() => setDetalleItem(null)}>Cerrar</button>
              )}
            </>
          ); })()}
        </ModalOverlay>
      )}

      {modalAbierto && (
        <ModalOverlay titulo={enEdicion ? 'Editar Rol' : 'Nuevo Rol'} onClose={limpiar}>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Código del Rol</label>
            <input className="form-control" style={inputStyle} type="number" disabled={enEdicion}
              value={form.Codigo_Rol} placeholder="Código del Rol"
              onChange={e => setForm({...form, Codigo_Rol: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Nombre del Rol</label>
            <input className="form-control" style={inputStyle} value={form.Nombre_Rol}
              placeholder="Nombre del Rol"
              onChange={e => setForm({...form, Nombre_Rol: e.target.value})} />
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn fw-bold" style={{ flex: 1, background: 'var(--color-primary)', color: '#fff', border: 'none' }} onClick={guardar}>
              {enEdicion ? 'Actualizar' : 'Guardar Rol'}
            </button>
          </div>
        </ModalOverlay>
      )}

      <Navbar titulo="CELUACCEL — Privilegios y Roles" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Privilegios y Roles</h4>
            <p className="mb-0 opacity-75">Configura los niveles de acceso del sistema</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-danger fw-bold fs-6" style={{ backgroundColor: '#fff' }}>{datos.length} roles</span>
            <button className="btn btn-sm fw-bold" style={{ background: '#fff', color: 'var(--color-primary)', borderRadius: '8px', padding: '6px 14px' }} onClick={abrirNuevo}>
              + Nuevo rol
            </button>
          </div>
        </div>

        <div className="mb-3">
          <input type="text" className="form-control" style={inputStyle}
            placeholder="Buscar por código o descripción..."
            value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'0.75rem' }}>
          {datosPagina.map(d => {
            const info = COLORES_ROL[d.Codigo_Rol] || { bg: '#6c757d', label: `Rol ${d.Codigo_Rol}` };
            return (
              <div key={d.Codigo_Rol} className="card border-0 shadow-sm fade-in"
                style={{ borderLeft: `4px solid ${info.bg}`, borderRadius: 10 }}>
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: 42, height: 42, backgroundColor: `${info.bg}20` }}>
                    <span style={{ color: info.bg }}><IconShield /></span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{d.Nombre_Rol}</span>
                      <span className="badge" style={{ backgroundColor: info.bg, fontSize: '0.7rem' }}>#{d.Codigo_Rol}</span>
                    </div>
                  </div>
                  <div className="d-flex gap-1 align-items-center">
                    {esRolSistema(d.Codigo_Rol) ? (
                      <span className="badge d-flex align-items-center gap-1 px-2 py-1"
                        style={{ background: 'var(--color-border,#444)', color: 'var(--color-text-muted,#aaa)', fontSize: '0.72rem', fontWeight: 500, borderRadius: 6, cursor: 'default' }}
                        title="Rol del sistema protegido.">🔒 Protegido</span>
                    ) : null}
                    <button className="btn btn-sm fw-bold" style={{ fontSize:'0.77rem', background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:6 }}
                      onClick={() => abrirDetalle(d)}>Ver más</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPaginas > 1 && (
          <div className="mt-3">
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

export default Roles;