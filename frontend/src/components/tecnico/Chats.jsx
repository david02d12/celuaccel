import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { mostrarAlerta, confirmar } from '../../utils/alerts';
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

const Chats = ({ cerrarSesion, setVista }) => {
  const [chats, setChats] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const [form, setForm] = useState({ Codigo_Chat: '', ID_Usuario: '', ID_Servicio: '' });

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try { const res = await api.get('/chats/listar'); setChats(res.data); }
    catch (err) { console.error(err); }
  };

  const guardar = async () => {
    try {
      if (enEdicion) { await api.put('/chats/actualizar', form); }
      else { await api.post('/chats/agregar', form); }
      listar(); limpiar();
    } catch { await mostrarAlerta('Error al procesar el chat', 'error'); }
  };

  const eliminar = async (id) => {
    const idNum = Number(id);
    if (!Number.isInteger(idNum)) return;
    if (await confirmar('¿Eliminar chat?')) {
      try { await api.delete(`/chats/eliminar/${idNum}`); listar(); }
      catch { await mostrarAlerta('Error al eliminar chat', 'error'); }
    }
  };

  const limpiar = () => { setForm({ Codigo_Chat: '', ID_Usuario: '', ID_Servicio: '' }); setEnEdicion(false); setModalAbierto(false); };
  const abrirNuevo = () => { setForm({ Codigo_Chat: '', ID_Usuario: '', ID_Servicio: '' }); setEnEdicion(false); setModalAbierto(true); };
  const abrirEdicion = (c) => { setForm(c); setEnEdicion(true); setDetalleItem(null); setModalAbierto(true); };
  const abrirDetalle = (c) => setDetalleItem(c);

  return (
    <div>
      {detalleItem && (
        <ModalOverlay titulo={`Canal #${detalleItem.Codigo_Chat}`} onClose={() => setDetalleItem(null)}>
          <div className="text-center mb-3">
            <span className={`badge px-3 py-2 fs-6 ${detalleItem.ID_Servicio ? 'bg-primary' : 'bg-warning text-dark'}`}>
              {detalleItem.ID_Servicio ? `📡 Servicio #${detalleItem.ID_Servicio}` : '📋 Consulta Catálogo'}
            </span>
          </div>
          {[['Código Chat', detalleItem.Codigo_Chat], ['ID Usuario', detalleItem.ID_Usuario], ['ID Servicio', detalleItem.ID_Servicio || 'N/A'], ['Estado', detalleItem.Estado_Chat || 'Activo']].map(([l,v]) => (
            <div key={l} style={{ display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--color-border,#333)' }}>
              <span style={{ minWidth:130,fontWeight:700,fontSize:'0.88rem',color:'var(--color-text)' }}>{l}</span>
              <span style={{ color:'var(--color-text)',fontSize:'0.88rem' }}>{v}</span>
            </div>
          ))}
          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetalleItem(null)}>Cerrar</button>
            <button className="btn btn-outline-secondary" style={{ flex:1 }} onClick={() => abrirEdicion(detalleItem)}>✏️ Editar</button>
            <button className="btn" style={{ flex:1, background:'#dc3545', color:'#fff', border:'none' }} onClick={async () => { setDetalleItem(null); await eliminar(detalleItem.Codigo_Chat); }}>🗑 Eliminar</button>
          </div>
        </ModalOverlay>
      )}

      {modalAbierto && (
        <ModalOverlay titulo={enEdicion ? 'Editar Canal' : 'Nuevo Canal'} onClose={limpiar}>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Código Chat</label>
            <input className="form-control" style={{ ...inputStyle, opacity: 0.7 }}
              placeholder="Código Chat" value={form.Codigo_Chat} disabled readOnly />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">ID Usuario</label>
            <input className="form-control" style={inputStyle}
              placeholder="ID Usuario" value={form.ID_Usuario}
              onChange={e => setForm({...form, ID_Usuario: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">ID Servicio</label>
            <input className="form-control" style={inputStyle} type="number"
              placeholder="ID Servicio" value={form.ID_Servicio}
              onChange={e => setForm({...form, ID_Servicio: e.target.value})} />
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn fw-bold" style={{ flex: 1, background: 'var(--color-primary)', color: '#fff', border: 'none' }} onClick={guardar}>
              {enEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </ModalOverlay>
      )}

      <Navbar titulo="CELUACCEL — Administración de Canales" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Administración de Canales</h4>
            <p className="mb-0 opacity-75">Configura y gestiona los canales de chat activos</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-danger fw-bold fs-6" style={{ backgroundColor: '#fff' }}>{chats.length} canales</span>
            <button className="btn btn-sm fw-bold" style={{ background: '#fff', color: 'var(--color-primary)', borderRadius: '8px', padding: '6px 14px' }} onClick={abrirNuevo}>
              + Nuevo canal
            </button>
          </div>
        </div>

        <div className="mb-3">
          <input type="text" className="form-control" style={inputStyle}
            placeholder="Buscar por código, usuario, servicio o estado..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr><th>Cod</th><th>ID Usuario</th><th>ID Servicio</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {chats.filter(c =>
                  String(c.Codigo_Chat).includes(busqueda) ||
                  String(c.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                  String(c.ID_Servicio ?? '').includes(busqueda) ||
                  String(c.Estado_Chat || '').toLowerCase().includes(busqueda.toLowerCase())
                ).map(c => (
                  <tr key={c.Codigo_Chat} className="stagger-item">
                    <td>{c.Codigo_Chat}</td>
                    <td className="fw-bold">{c.ID_Usuario}</td>
                    <td>{c.ID_Servicio
                      ? <span className="badge bg-primary">Servicio #{c.ID_Servicio}</span>
                      : <span className="badge bg-warning text-dark">Catálogo</span>}
                    </td>
                    <td>
                      {c.Estado_Chat === 'Oculto' 
                        ? <span className="badge bg-secondary">Oculto</span> 
                        : <span className="badge bg-success">Activo</span>}
                    </td>
                    <td>
                      <button className="btn btn-sm fw-bold" style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.77rem' }}
                        onClick={() => abrirDetalle(c)}>Ver más</button>
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

export default Chats;