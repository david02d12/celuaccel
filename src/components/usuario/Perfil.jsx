import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Perfil = ({ cerrarSesion, setVista, perfilObjetivoId }) => {
  const miUsuario = localStorage.getItem('user') || '';

  // Si viene perfilObjetivoId (técnico viendo cliente), cargamos ese perfil
  // Si no, cargamos el perfil propio
  const idAcargar = perfilObjetivoId || miUsuario;
  const esPropioPeril = idAcargar === miUsuario;

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [form, setForm] = useState({
    Nombre: '', Fecha_Nacimiento: '', Direccion: '', Telefono: '', Correo: '', Clave: ''
  });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => {
    cargarPerfil();
  }, [idAcargar]);

  const cargarPerfil = async () => {
    setCargando(true);
    try {
      const res = await api.get(`/usuarios/perfil/${idAcargar}`);
      setPerfil(res.data);
      setForm({
        Nombre: res.data.Nombre || '',
        Fecha_Nacimiento: res.data.Fecha_Nacimiento ? String(res.data.Fecha_Nacimiento).split('T')[0] : '',
        Direccion: res.data.Direccion || '',
        Telefono: res.data.Telefono || '',
        Correo: res.data.Correo || '',
        Clave: ''
      });
    } catch (err) {
      mostrarToast('Error al cargar el perfil. Verifica tu conexión.', false);
    } finally {
      setCargando(false);
    }
  };

  const guardarCambios = async () => {
    if (!form.Nombre.trim() || !form.Correo.trim()) {
      return mostrarToast('Nombre y correo son obligatorios.', false);
    }
    try {
      await api.put('/usuarios/mi-perfil', form);
      mostrarToast('¡Perfil actualizado correctamente!');
      setModoEdicion(false);
      cargarPerfil();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al actualizar el perfil.', false);
    }
  };

  const nombreRol = (codigo) => {
    if (codigo === 1) return { texto: 'Técnico', color: '#0d6efd' };
    if (codigo === 2) return { texto: 'Cliente', color: '#198754' };
    if (codigo === 3) return { texto: 'Administrador', color: '#DC3545' };
    return { texto: `Rol ${codigo}`, color: '#6c757d' };
  };

  const inicial = (nombre) => nombre ? nombre.charAt(0).toUpperCase() : '?';

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo={esPropioPeril ? 'CELUACCEL — Mi Perfil' : 'CELUACCEL — Perfil del Cliente'} cerrarSesion={cerrarSesion} />

      <div className="container mt-4" style={{ maxWidth: '800px' }}>

        {/* ENCABEZADO */}
        <div className="mb-4 d-flex align-items-center gap-4 flex-wrap module-banner">
          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow"
            style={{ width: '80px', height: '80px', fontSize: '2rem', backgroundColor: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', flexShrink: 0 }}>
            {perfil ? inicial(perfil.Nombre) : '?'}
          </div>
          <div>
            <h4 className="fw-bold mb-1">{perfil?.Nombre || 'Cargando...'}</h4>
            {perfil && (
              <span className="badge fs-6 px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
                {nombreRol(perfil.Codigo_Rol).texto}
              </span>
            )}
          </div>
          {esPropioPeril && !modoEdicion && (
            <div className="ms-auto">
              <button className="btn btn-light fw-bold text-danger px-4"
                onClick={() => setModoEdicion(true)}>
                Editar Perfil
              </button>
            </div>
          )}
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--color-primary)' }} role="status" />
            <p className="mt-3 text-muted">Cargando perfil...</p>
          </div>
        ) : !perfil ? (
          <div className="text-center py-5">
            <h5 className="text-muted">No se pudo cargar el perfil.</h5>
          </div>
        ) : modoEdicion ? (
          /* ─── MODO EDICIÓN ─── */
          <div className="card border-0 shadow-sm p-4 fade-in-up">
            <h5 className="fw-bold mb-4" style={{ color: 'var(--color-primary)' }}>Editar Información Personal</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Nombre Completo *</label>
                <input className="form-control" value={form.Nombre}
                  onChange={e => setForm({...form, Nombre: e.target.value})}
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }} />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Fecha de Nacimiento</label>
                <input className="form-control" type="date" value={form.Fecha_Nacimiento}
                  onChange={e => setForm({...form, Fecha_Nacimiento: e.target.value})}
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }} />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Correo Electrónico *</label>
                <input className="form-control" type="email" value={form.Correo}
                  onChange={e => setForm({...form, Correo: e.target.value})}
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }} />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Teléfono</label>
                <input className="form-control" value={form.SuperClass || form.Telefono}
                  onChange={e => setForm({...form, Telefono: e.target.value})}
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }} />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Dirección</label>
                <input className="form-control" value={form.Direccion}
                  onChange={e => setForm({...form, Direccion: e.target.value})}
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }} />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Nueva contraseña <span className="text-muted fw-normal">(dejar vacío para no cambiar)</span></label>
                <input className="form-control" type="password" placeholder="Nueva contraseña..."
                  value={form.Clave}
                  onChange={e => setForm({...form, Clave: e.target.value})}
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }} />
              </div>
              <div className="col-12 d-flex gap-2 justify-content-end mt-2">
                <button className="btn btn-secondary fw-bold" onClick={() => setModoEdicion(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary fw-bold px-5"
                  onClick={guardarCambios}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ─── MODO VISTA ─── */
          <div className="card border-0 shadow-sm">
            <div className="card-header fw-bold bg-transparent border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--color-border)' }}>
              <span>Información del Perfil</span>
              {!esPropioPeril && (
                <span className="badge bg-danger">Solo lectura</span>
              )}
            </div>
            <div className="card-body p-0">
              <table className="table table-borderless mb-0">
                <tbody>
                  {[
                    { label: 'ID / Usuario', valor: perfil.ID_Usuario },
                    { label: 'Nombre Completo', valor: perfil.Nombre },
                    { label: 'Correo Electrónico', valor: perfil.Correo },
                    { label: 'Teléfono', valor: perfil.Telefono || '—' },
                    { label: 'Dirección', valor: perfil.Direccion || '—' },
                    { label: 'Fecha de Nacimiento', valor: perfil.Fecha_Nacimiento ? String(perfil.Fecha_Nacimiento).split('T')[0] : '—' },
                    { label: 'Rol en el sistema', valor: (
                      <span className="badge px-3 py-2" style={{ backgroundColor: nombreRol(perfil.Codigo_Rol).color }}>
                        {nombreRol(perfil.Codigo_Rol).texto}
                      </span>
                    )},
                  ].map((fila, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'var(--color-surfaceAlt)' : 'transparent' }}>
                      <td className="fw-bold text-muted py-3 ps-4" style={{ width: '200px' }}>{fila.label}</td>
                      <td className="py-3" style={{ color: 'var(--color-text)' }}>{fila.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Botón volver */}
        <div className="mt-4">
          <button className="btn btn-outline-secondary fw-bold"
            onClick={() => setVista(perfilObjetivoId ? 'servicios' : 'home')}>
            ← Volver
          </button>
        </div>
      </div>

      {/* MENÚ LATERAL */}
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

export default Perfil;
