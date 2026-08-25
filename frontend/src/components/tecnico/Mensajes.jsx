import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { mostrarAlerta, confirmar } from '../../utils/alerts';
import { getLimitesGeneralesFecha } from '../../utils/validaciones';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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

const Mensajes = ({ cerrarSesion, setVista }) => {
  const [mensajes, setMensajes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const { minDate, maxDate } = getLimitesGeneralesFecha();
  const miUsuario = sessionStorage.getItem('user');
  const [form, setForm] = useState({
    Codigo_Mensaje: '', Codigo_Chat: '', ID_Usuario: '', Fecha_Mensaje: '', Mensaje: '', Estado: 0
  });

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try { const res = await api.get('/mensajes/listar'); setMensajes(res.data); }
    catch (err) { console.error(err); }
  };

  const guardar = async () => {
    try {
      if (enEdicion) { await api.put('/mensajes/actualizar', form); }
      else { await api.post('/mensajes/agregar', form); }
      listar(); limpiar();
    } catch { await mostrarAlerta('Error al procesar el mensaje', 'error'); }
  };

  const eliminar = async (id) => {
    const idNum = Number(id);
    if (!Number.isInteger(idNum)) return;
    if (await confirmar('¿Eliminar este mensaje?')) {
      try { await api.delete(`/mensajes/eliminar/${idNum}`); listar(); }
      catch { await mostrarAlerta('Error al eliminar el mensaje', 'error'); }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Mensaje: '', Codigo_Chat: '', ID_Usuario: '', Fecha_Mensaje: '', Mensaje: '', Estado: 0 });
    setEnEdicion(false); setModalAbierto(false);
  };
  const abrirNuevo = () => {
    setForm({ Codigo_Mensaje: '', Codigo_Chat: '', ID_Usuario: '', Fecha_Mensaje: '', Mensaje: '', Estado: 0 });
    setEnEdicion(false); setModalAbierto(true);
  };
  const abrirEdicion = (m) => { setForm(m); setEnEdicion(true); setDetalleItem(null); setModalAbierto(true); };
  const abrirDetalle = (m) => setDetalleItem(m);

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  return (
    <div>
      {detalleItem && (() => {
        const leido = Number(detalleItem.Estado) === 1;
        const esMio = String(detalleItem.ID_Usuario) === String(miUsuario);
        return (
          <ModalOverlay titulo={`Mensaje #${detalleItem.Codigo_Mensaje}`} onClose={() => setDetalleItem(null)}>
            <div className="text-center mb-3">
              <span className={`badge px-3 py-2 fs-6 ${leido ? 'bg-success' : 'bg-warning text-dark'}`}>
                {leido ? '✔ Leído' : '⏳ Pendiente'}
              </span>
            </div>
            {[['Cód. Chat', detalleItem.Codigo_Chat], ['ID Usuario', detalleItem.ID_Usuario], ['Fecha', detalleItem.Fecha_Mensaje ? new Date(detalleItem.Fecha_Mensaje).toLocaleDateString() : '—']].map(([l,v]) => (
              <div key={l} style={{ display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--color-border,#333)' }}>
                <span style={{ minWidth:130,fontWeight:700,fontSize:'0.88rem',color:'var(--color-text)' }}>{l}</span>
                <span style={{ color:'var(--color-text)',fontSize:'0.88rem' }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid var(--color-border,#333)' }}>
              <span style={{ minWidth:130,fontWeight:700,fontSize:'0.88rem',color:'var(--color-text)' }}>Mensaje</span>
              <span style={{ color:'var(--color-text)',fontSize:'0.88rem',fontStyle:'italic',flex:1 }}>{detalleItem.Mensaje}</span>
            </div>
            {esMio ? (
              <div className="d-flex gap-2 mt-4">
                <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetalleItem(null)}>Cerrar</button>
                <button className="btn btn-outline-secondary" style={{ flex:1 }} onClick={() => abrirEdicion(detalleItem)}>✏️ Editar</button>
                <button className="btn" style={{ flex:1, background:'#dc3545', color:'#fff', border:'none' }} onClick={async () => { setDetalleItem(null); await eliminar(detalleItem.Codigo_Mensaje); }}>🗑 Eliminar</button>
              </div>
            ) : (
              <button className="btn btn-secondary w-100 mt-4" onClick={() => setDetalleItem(null)}>Cerrar</button>
            )}
          </ModalOverlay>
        );
      })()}

      {modalAbierto && (
        <ModalOverlay titulo={enEdicion ? 'Editar Mensaje' : 'Nuevo Mensaje'} onClose={limpiar}>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Código Chat</label>
            <input className="form-control" style={inputStyle} type="number"
              placeholder="Código Chat" value={form.Codigo_Chat}
              onChange={e => setForm({...form, Codigo_Chat: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">ID Usuario</label>
            <input className="form-control" style={inputStyle}
              placeholder="ID Usuario" value={form.ID_Usuario}
              onChange={e => setForm({...form, ID_Usuario: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Mensaje</label>
            <textarea className="form-control" style={inputStyle} rows={3}
              placeholder="Escribe el mensaje..." value={form.Mensaje}
              onChange={e => setForm({...form, Mensaje: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Fecha</label>
            <input className="form-control" style={inputStyle} type="date"
              min={minDate} max={maxDate} value={form.Fecha_Mensaje}
              onChange={e => setForm({...form, Fecha_Mensaje: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Estado</label>
            <select className="form-select" style={inputStyle} value={form.Estado}
              onChange={e => setForm({...form, Estado: e.target.value})}>
              <option value="0">No leído</option>
              <option value="1">Leído</option>
            </select>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn fw-bold" style={{ flex: 1, background: 'var(--color-primary)', color: '#fff', border: 'none' }} onClick={guardar}>
              {enEdicion ? 'Actualizar' : 'Enviar'}
            </button>
          </div>
        </ModalOverlay>
      )}

      <Navbar titulo="CELUACCEL — Bandeja de Mensajes" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Bandeja de Mensajes</h4>
            <p className="mb-0 opacity-75">Controla y edita los mensajes enviados en los chats</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-danger fw-bold fs-6" style={{ backgroundColor: '#fff' }}>{mensajes.length} mensajes</span>
            <button className="btn btn-sm fw-bold" style={{ background: '#fff', color: 'var(--color-primary)', borderRadius: '8px', padding: '6px 14px' }} onClick={abrirNuevo}>
              + Nuevo mensaje
            </button>
          </div>
        </div>

        <div className="mb-3">
          <input type="text" className="form-control" style={inputStyle}
            placeholder="Buscar por ID mensaje, ID chat, fecha, usuario o contenido..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Chat</th>
                  <th>Usuario</th>
                  <th>Mensaje</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mensajes.filter(m =>
                  String(m.Codigo_Mensaje).includes(busqueda) ||
                  String(m.Codigo_Chat).includes(busqueda) ||
                  String(m.Fecha_Mensaje || '').includes(busqueda) ||
                  String(m.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                  String(m.Mensaje || '').toLowerCase().includes(busqueda.toLowerCase())
                ).map(m => (
                  <tr key={m.Codigo_Mensaje} className="stagger-item">
                    <td>{m.Codigo_Chat}</td>
                    <td className="fw-bold">{m.ID_Usuario}</td>
                    <td className="small" style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={m.Mensaje}>{m.Mensaje}</td>
                    <td>
                      <span className={`badge ${Number(m.Estado) === 1 ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {Number(m.Estado) === 1 ? '✔ Leído' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm fw-bold" style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.77rem' }}
                        onClick={() => abrirDetalle(m)}>Ver más</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default Mensajes;