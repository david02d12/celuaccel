import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ROL_INFO = {
  1: { label: 'Tecnico',       color: '#0d6efd' },
  2: { label: 'Cliente',       color: '#6c757d' },
  3: { label: 'Administrador', color: '#DB0000' },
};

const getIniciales = (nombre = '') => {
  const partes = nombre.trim().split(' ');
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
};

const Usuarios = ({ cerrarSesion, setVista }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    ID_Usuario: '', Codigo_Documento: '', Nombre: '', Fecha_Nacimiento: '',
    Direccion: '', Telefono: '', Correo: '', Clave: '', Codigo_Rol: 2
  });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/usuarios/listar');
      setUsuarios(res.data);
    } catch { console.error('Error al listar usuarios'); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'usuarios/actualizar' : 'registro';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/${url}`, form);
      mostrarToast(enEdicion ? 'Usuario actualizado.' : 'Usuario registrado en el sistema.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar usuario. Verifica los datos o si el ID ya existe.', false); }
  };

  const eliminar = async (id) => {
    if (window.confirm(`Eliminar al usuario ${id}?`)) {
      try {
        await api.delete(`/usuarios/eliminar/${id}`);
        mostrarToast('Usuario eliminado del sistema.'); listar();
      } catch { mostrarToast('Error al eliminar usuario.', false); }
    }
  };

  const limpiar = () => {
    setForm({ ID_Usuario: '', Codigo_Documento: '', Nombre: '', Fecha_Nacimiento: '', Direccion: '', Telefono: '', Correo: '', Clave: '', Codigo_Rol: 2 });
    setEnEdicion(false);
  };

  const prepararEdicion = (u) => {
    const fechaFormateada = u.Fecha_Nacimiento ? new Date(u.Fecha_Nacimiento).toISOString().split('T')[0] : '';
    setForm({ ...u, Fecha_Nacimiento: fechaFormateada, Clave: '' });
    setEnEdicion(true);
  };

  const usuariosFiltrados = usuarios.filter(u =>
    String(u.ID_Usuario).toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.Correo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
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

      <Navbar titulo="CELUACCEL — Directorio de Usuarios" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Directorio de Usuarios</h4>
            <p className="mb-0 opacity-75">Gestiona cuentas, roles y datos personales</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{usuarios.length} usuarios</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ width: 4, height: 20, background: 'var(--color-primary)', borderRadius: 2, display: 'inline-block' }}/>
                <h5 className="mb-0 fw-bold">{enEdicion ? 'Editar Perfil' : 'Registrar Usuario'}</h5>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <input className="form-control" style={inputStyle} placeholder="ID Usuario"
                    value={form.ID_Usuario} disabled={enEdicion}
                    onChange={e => setForm({...form, ID_Usuario: e.target.value})} />
                </div>
                <div className="col-6">
                  <input className="form-control" style={inputStyle} type="number" placeholder="Cod. Doc."
                    value={form.Codigo_Documento} onChange={e => setForm({...form, Codigo_Documento: e.target.value})} />
                </div>
              </div>
              <input className="form-control mb-2" style={inputStyle} placeholder="Nombre Completo"
                value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Fecha de Nacimiento</label>
              <input className="form-control mb-2" style={inputStyle} type="date"
                value={form.Fecha_Nacimiento} onChange={e => setForm({...form, Fecha_Nacimiento: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="Direccion"
                value={form.Direccion} onChange={e => setForm({...form, Direccion: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="Telefono"
                value={form.Telefono} onChange={e => setForm({...form, Telefono: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} type="email" placeholder="Correo Electronico"
                value={form.Correo} onChange={e => setForm({...form, Correo: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} type="password"
                placeholder={enEdicion ? 'Nueva Clave (opcional)' : 'Contrasena'}
                value={form.Clave} onChange={e => setForm({...form, Clave: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Rol</label>
              <select className="form-select mb-3" style={inputStyle} value={form.Codigo_Rol}
                onChange={e => setForm({...form, Codigo_Rol: Number(e.target.value)})}>
                <option value={1}>Tecnico</option>
                <option value={2}>Cliente</option>
                <option value={3}>Administrador</option>
              </select>
              <button className="btn w-100 btn-primary fw-bold" onClick={guardar}>
                {enEdicion ? 'Actualizar Datos' : 'Registrar'}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          {/* CARDS DE USUARIOS */}
          <div className="col-lg-8 col-12">
            <div className="mb-3">
              <input type="text" className="form-control" style={inputStyle}
                placeholder="Buscar por ID, nombre, correo o rol..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>

            <div className="d-flex flex-column gap-2">
              {datosPagina.map(u => {
                const info = ROL_INFO[u.Codigo_Rol] || { label: `Rol ${u.Codigo_Rol}`, color: '#6c757d' };
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
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.77rem' }}
                          onClick={() => prepararEdicion(u)}>
                          Editar
                        </button>
                        <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.77rem' }}
                          onClick={() => eliminar(u.ID_Usuario)}>
                          Borrar
                        </button>
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

export default Usuarios;