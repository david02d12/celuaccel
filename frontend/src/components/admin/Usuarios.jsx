import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import { calcFechaLimites } from '../../utils/validaciones';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ROL_INFO = {
  1: { color: '#0d6efd' },
  2: { color: '#6c757d' },
  3: { color: '#DB0000' },
};

const getIniciales = (nombre = '') => {
  const partes = nombre.trim().split(' ');
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
};

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

const Usuarios = ({ cerrarSesion, setVista }) => {
  const miUsuario = sessionStorage.getItem('user');
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const { minDate, maxDate } = calcFechaLimites();
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const [form, setForm] = useState({
    ID_Usuario: '', Codigo_Documento: '', Nombre: '', Fecha_Nacimiento: '',
    Direccion: '', Telefono: '', Correo: '', Clave: '', Codigo_Rol: 2
  });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => { listar(); listarRoles(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/usuarios/listar');
      setUsuarios(res.data);
    } catch { console.error('Error al listar usuarios'); }
  };

  const listarRoles = async () => {
    try {
      const res = await api.get('/roles/listar');
      setRoles(res.data);
    } catch { console.error('Error al listar roles'); }
  };

  const guardar = async () => {
    if (form.Clave) {
      if (form.Clave.trim().length < 6) return mostrarToast('La contraseña debe tener al menos 6 caracteres.', false);
      if (form.Clave.trim().length > 15) return mostrarToast('La contraseña no puede exceder los 15 caracteres.', false);
    }
    try {
      const url = enEdicion ? 'usuarios/actualizar' : 'registro';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/${url}`, form);
      mostrarToast(enEdicion ? 'Usuario actualizado.' : 'Usuario registrado en el sistema.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar usuario. Verifica los datos o si el ID ya existe.', false); }
  };

  const eliminar = async (id) => {
    if (await confirmar(`Eliminar al usuario ${id}?`)) {
      try {
        await api.delete(`/usuarios/eliminar/${id}`);
        mostrarToast('Usuario eliminado del sistema.'); listar();
      } catch { mostrarToast('Error al eliminar usuario.', false); }
    }
  };

  const limpiar = () => {
    setForm({ ID_Usuario: '', Codigo_Documento: '', Nombre: '', Fecha_Nacimiento: '', Direccion: '', Telefono: '', Correo: '', Clave: '', Codigo_Rol: 2 });
    setEnEdicion(false);
    setModalAbierto(false);
  };

  const prepararEdicion = (u) => {
    const fechaFormateada = u.Fecha_Nacimiento ? new Date(u.Fecha_Nacimiento).toISOString().split('T')[0] : '';
    setForm({ ...u, Fecha_Nacimiento: fechaFormateada, Clave: '' });
    setEnEdicion(true);
    setDetalleItem(null);
    setModalAbierto(true);
  };
  const abrirNuevo = () => {
    setForm({ ID_Usuario: '', Codigo_Documento: '', Nombre: '', Fecha_Nacimiento: '', Direccion: '', Telefono: '', Correo: '', Clave: '', Codigo_Rol: 2 });
    setEnEdicion(false);
    setModalAbierto(true);
  };
  const abrirDetalle = (u) => setDetalleItem(u);

  const usuariosFiltrados = usuarios.filter(u =>
    String(u.ID_Usuario).toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.Correo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.Telefono || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.Direccion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (ROL_INFO[u.Codigo_Rol]?.label || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(usuariosFiltrados, 6);

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      {detalleItem && (() => {
        const rolDB = roles.find(r => r.Codigo_Rol === detalleItem.Codigo_Rol);
        const rolNombre = rolDB ? rolDB.Nombre_Rol : `Rol ${detalleItem.Codigo_Rol}`;
        const info = ROL_INFO[detalleItem.Codigo_Rol] || { color: '#6c757d' };
        const fila = (label, val) => (
          <div style={{ display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--color-border,#333)' }}>
            <span style={{ minWidth:140,fontWeight:700,fontSize:'0.88rem',color:'var(--color-text)' }}>{label}</span>
            <span style={{ color:'var(--color-text)',fontSize:'0.88rem',flex:1 }}>{val || '—'}</span>
          </div>
        );
        return (
          <ModalOverlay titulo={detalleItem.Nombre || detalleItem.ID_Usuario} onClose={() => setDetalleItem(null)}>
            {fila('ID Usuario', detalleItem.ID_Usuario)}
            {fila('Nombre', detalleItem.Nombre)}
            {fila('Correo', detalleItem.Correo)}
            {fila('Teléfono', detalleItem.Telefono)}
            {fila('Dirección', detalleItem.Direccion)}
            {fila('Rol', rolNombre)}
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetalleItem(null)}>Cerrar</button>
              <button className="btn btn-outline-secondary" style={{ flex:1 }} onClick={() => prepararEdicion(detalleItem)}>✏️ Editar</button>
              <button className="btn" style={{ flex:1, background:'#dc3545', color:'#fff', border:'none' }} onClick={async () => { setDetalleItem(null); await eliminar(detalleItem.ID_Usuario); }}>🗑 Eliminar</button>
            </div>
          </ModalOverlay>
        );
      })()}

      <Navbar titulo="CELUACCEL — Directorio de Usuarios" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Directorio de Usuarios</h4>
            <p className="mb-0 opacity-75">Gestiona cuentas, roles y datos personales</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-danger fw-bold fs-6" style={{ backgroundColor: '#fff' }}>{usuarios.length} usuarios</span>
            <button className="btn btn-sm fw-bold" style={{ background: '#fff', color: 'var(--color-primary)', borderRadius: '8px', padding: '6px 14px' }} onClick={abrirNuevo}>
              + Nuevo usuario
            </button>
          </div>
        </div>

      {modalAbierto && (
        <ModalOverlay titulo={enEdicion ? 'Editar Perfil' : 'Registrar Usuario'} onClose={limpiar}>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">ID Usuario</label>
            <input className="form-control" style={inputStyle} placeholder="ID Usuario"
              value={form.ID_Usuario} disabled={enEdicion}
              onChange={e => setForm({...form, ID_Usuario: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Cód. Tipo Documento</label>
            <input className="form-control" style={inputStyle} type="number" placeholder="Cod. Doc."
              value={form.Codigo_Documento} onChange={e => setForm({...form, Codigo_Documento: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Nombre Completo</label>
            <input className="form-control" style={inputStyle} placeholder="Nombre Completo"
              value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Fecha de Nacimiento</label>
            <input className="form-control" style={inputStyle} type="date" min={minDate} max={maxDate}
              value={form.Fecha_Nacimiento} onChange={e => setForm({...form, Fecha_Nacimiento: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Dirección</label>
            <input className="form-control" style={inputStyle} placeholder="Direccion"
              value={form.Direccion} onChange={e => setForm({...form, Direccion: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Teléfono</label>
            <input className="form-control" style={inputStyle} placeholder="Telefono"
              value={form.Telefono} onChange={e => setForm({...form, Telefono: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Correo Electrónico</label>
            <input className="form-control" style={inputStyle} type="email" placeholder="Correo Electronico"
              value={form.Correo} onChange={e => setForm({...form, Correo: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Contraseña</label>
            <input className="form-control" style={inputStyle} type="password"
              placeholder={enEdicion ? 'Nueva Clave (opcional)' : 'Contrasena'} maxLength="15"
              value={form.Clave} onChange={e => setForm({...form, Clave: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Rol</label>
            <select className="form-select" style={inputStyle} value={form.Codigo_Rol}
              disabled={enEdicion && String(form.ID_Usuario) === String(miUsuario)}
              onChange={e => setForm({...form, Codigo_Rol: Number(e.target.value)})}>
              {roles.map(r => (<option key={r.Codigo_Rol} value={r.Codigo_Rol}>{r.Nombre_Rol}</option>))}
            </select>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn fw-bold" style={{ flex: 1, background: 'var(--color-primary)', color: '#fff', border: 'none' }} onClick={guardar}>
              {enEdicion ? 'Actualizar Datos' : 'Registrar'}
            </button>
          </div>
        </ModalOverlay>
      )}

        <div className="mb-3">
          <input type="text" className="form-control" style={inputStyle}
            placeholder="Buscar por ID, nombre, correo, teléfono, dirección o rol..."
            value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'0.75rem' }}>
          {datosPagina.map(u => {
                const rolDB = roles.find(r => r.Codigo_Rol === u.Codigo_Rol);
                const rolNombre = rolDB ? rolDB.Nombre_Rol : `Rol ${u.Codigo_Rol}`;
                const info = ROL_INFO[u.Codigo_Rol] || { color: '#6c757d' };
                info.label = rolNombre;
                const iniciales = getIniciales(u.Nombre || u.ID_Usuario);
                return (
                  <div key={u.ID_Usuario} className="card border-0 shadow-sm fade-in"
                    style={{ borderLeft: `4px solid ${info.color}`, borderRadius: 12 }}>
                    <div className="card-body p-3 d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                        style={{ width: 46, height: 46, backgroundColor: `${info.color}22`, color: info.color, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                        {iniciales}
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="fw-bold" style={{ fontSize: '0.92rem' }}>{u.Nombre}</span>
                          <span className="badge" style={{ backgroundColor: info.color, fontSize: '0.68rem' }}>
                            {info.label}
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {u.Correo}
                          {u.Telefono && <span className="ms-2">· {u.Telefono}</span>}
                          <span className="ms-2 opacity-60">ID: {u.ID_Usuario}</span>
                        </div>
                      </div>
                      <div className="d-flex gap-1 flex-shrink-0">
                        <button className="btn btn-sm fw-bold" style={{ fontSize:'0.77rem', background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:6 }}
                          onClick={() => abrirDetalle(u)}>Ver más</button>
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

export default Usuarios;