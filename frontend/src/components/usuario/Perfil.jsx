import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import {
  validarNombre, validarTelefono,
  validarDireccion, fuerzaClave,
} from '../../utils/validaciones';

const FuerzaClave = ({ clave }) => {
  if (!clave) return null;
  const f = fuerzaClave(clave);
  return (
    <div className="mt-2">
      <div className="d-flex gap-1 mb-1">
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: i <= f.nivel ? f.color : 'var(--color-border)', transition: 'background-color 0.3s' }} />
        ))}
      </div>
      <small style={{ color: f.color, fontSize: '11px', fontWeight: 600 }}>{f.texto}</small>
    </div>
  );
};

const CampoError = ({ mensaje }) =>
  mensaje ? <div className="invalid-feedback d-block" style={{ fontSize: '12px' }}>{mensaje}</div> : null;

/**
 * FormEdicion — Solo permite cambiar: Nombre, Teléfono, Dirección y Contraseña.
 * Correo y Fecha de Nacimiento son datos de identidad y NO se pueden modificar (RF-003).
 */
const FormEdicion = ({ form, setForm, errores, setErrores, guardarCambios, setModoEdicion }) => {
  const iStyle = (k) => ({ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: errores[k] ? '#dc3545' : 'var(--color-border)' });
  const onChange = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrores(p => ({ ...p, [k]: '' })); };

  return (
    <div className="card border-0 shadow-sm p-4 fade-in-up">
      <h5 className="fw-bold mb-1" style={{ color: 'var(--color-primary)' }}>Editar Información Personal</h5>
      <p className="text-muted small mb-4">El correo electrónico y la fecha de nacimiento son datos de identidad y no pueden modificarse.</p>
      <div className="row g-3">

        {/* ── Nombre ── */}
        <div className="col-md-6">
          <label className="small fw-bold text-muted mb-1">Nombre Completo *</label>
          <input className={`form-control ${errores.Nombre ? 'is-invalid' : ''}`} value={form.Nombre} placeholder="Ej: Juan Pérez" style={iStyle('Nombre')} onChange={onChange('Nombre')} />
          <CampoError mensaje={errores.Nombre} />
        </div>

        {/* ── Teléfono ── */}
        <div className="col-md-6">
          <label className="small fw-bold text-muted mb-1">Teléfono <span className="text-muted fw-normal">(opcional)</span></label>
          <input className={`form-control ${errores.Telefono ? 'is-invalid' : ''}`} value={form.Telefono} placeholder="Ej: 3001234567" maxLength={10} style={iStyle('Telefono')} onChange={onChange('Telefono')} />
          {errores.Telefono ? <CampoError mensaje={errores.Telefono} /> : <small className="text-muted mt-1 d-block">Celular: 10 dígitos iniciando en 3. Fijo: 7 dígitos.</small>}
        </div>

        {/* ── Dirección ── */}
        <div className="col-12">
          <label className="small fw-bold text-muted mb-1">Dirección <span className="text-muted fw-normal">(opcional)</span></label>
          <input className={`form-control ${errores.Direccion ? 'is-invalid' : ''}`} value={form.Direccion} placeholder="Ej: Calle 45 #12-30" style={iStyle('Direccion')} onChange={onChange('Direccion')} />
          <CampoError mensaje={errores.Direccion} />
        </div>

        {/* ── Nueva contraseña ── */}
        <div className="col-12">
          <label className="small fw-bold text-muted mb-1">Nueva contraseña <span className="text-muted fw-normal">(dejar vacío para no cambiar)</span></label>
          <input className={`form-control ${errores.Clave ? 'is-invalid' : ''}`} type="password" placeholder="Mínimo 6 caracteres..." maxLength="15" value={form.Clave} style={iStyle('Clave')} onChange={onChange('Clave')} />
          <CampoError mensaje={errores.Clave} />
          <FuerzaClave clave={form.Clave} />
        </div>

        {/* ── Confirmar nueva contraseña ── */}
        {form.Clave && (
          <div className="col-12">
            <label className="small fw-bold text-muted mb-1">Confirmar nueva contraseña *</label>
            <input
              className={`form-control ${
                form.ClaveConfirm
                  ? form.Clave === form.ClaveConfirm ? 'is-valid' : 'is-invalid'
                  : errores.ClaveConfirm ? 'is-invalid' : ''
              }`}
              type="password"
              placeholder="Repite la nueva contraseña"
              maxLength="15"
              value={form.ClaveConfirm}
              style={iStyle('ClaveConfirm')}
              onChange={onChange('ClaveConfirm')}
            />
            {form.ClaveConfirm && form.Clave !== form.ClaveConfirm && (
              <small className="text-danger">Las contraseñas no coinciden.</small>
            )}
            {form.ClaveConfirm && form.Clave === form.ClaveConfirm && (
              <small className="text-success">✓ Las contraseñas coinciden.</small>
            )}
            <CampoError mensaje={errores.ClaveConfirm} />
          </div>
        )}

        <div className="col-12 d-flex gap-2 justify-content-end mt-2">
          <button className="btn btn-secondary fw-bold" onClick={() => setModoEdicion(false)}>Cancelar</button>
          <button className="btn btn-primary fw-bold px-5" onClick={guardarCambios}>Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

const VistaPerfil = ({ perfil, esPropioPeril, nombreRol }) => {
  const filas = [
    { label: 'ID / Documento',      valor: perfil.ID_Usuario },
    { label: 'Nombre Completo',     valor: perfil.Nombre },
    { label: 'Correo Electrónico',  valor: perfil.Correo },
    { label: 'Teléfono',            valor: perfil.Telefono || '—' },
    { label: 'Dirección',           valor: perfil.Direccion || '—' },
    { label: 'Fecha de Nacimiento', valor: perfil.Fecha_Nacimiento ? String(perfil.Fecha_Nacimiento).split('T')[0] : '—' },
    { label: 'Rol en el sistema',   valor: <span className="badge px-3 py-2" style={{ backgroundColor: nombreRol(perfil.Codigo_Rol).color }}>{nombreRol(perfil.Codigo_Rol).texto}</span> },
  ];
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header fw-bold bg-transparent border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--color-border)' }}>
        <span>Información del Perfil</span>
        {!esPropioPeril && <span className="badge bg-danger">Solo lectura</span>}
      </div>
      <div className="card-body p-0">
        <table className="table table-borderless mb-0">
          <tbody>
            {filas.map((fila, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'var(--color-surfaceAlt)' : 'transparent' }}>
                <td className="fw-bold text-muted py-3 ps-4" style={{ width: '200px' }}>{fila.label}</td>
                <td className="py-3" style={{ color: 'var(--color-text)' }}>{fila.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Perfil = ({ cerrarSesion, setVista, perfilObjetivoId }) => {
  const miUsuario     = sessionStorage.getItem('user') || '';
  const idAcargar     = perfilObjetivoId || miUsuario;
  const esPropioPeril = idAcargar === miUsuario;

  const [perfil, setPerfil]           = useState(null);
  const [cargando, setCargando]       = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [toast, setToast]             = useState({ visible: false, msg: '', ok: true });
  const [errores, setErrores]         = useState({});
  // Formulario: SIN Correo y SIN Fecha_Nacimiento (no editables)
  const [form, setForm] = useState({ Nombre: '', Direccion: '', Telefono: '', Clave: '', ClaveConfirm: '' });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  const cargarPerfil = async () => {
    setCargando(true);
    try {
      const res = await api.get(`/usuarios/perfil/${idAcargar}`);
      setPerfil(res.data);
      setForm({
        Nombre:    res.data.Nombre    || '',
        Direccion: res.data.Direccion || '',
        Telefono:  res.data.Telefono  || '',
        Clave:     '',
        ClaveConfirm: ''
      });
    } catch {
      mostrarToast('Error al cargar el perfil. Verifica tu conexión.', false);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAcargar]);

  const guardarCambios = async () => {
    const nuevosErrores = {
      Nombre:    validarNombre(form.Nombre),
      Telefono:  validarTelefono(form.Telefono),
      Direccion: validarDireccion(form.Direccion),
      Clave:     form.Clave && form.Clave.length < 6
        ? 'La contraseña debe tener al menos 6 caracteres.'
        : (form.Clave && form.Clave.length > 15
          ? 'La contraseña no puede exceder los 15 caracteres.'
          : ''),
      ClaveConfirm: form.Clave && form.Clave !== form.ClaveConfirm
        ? 'Las contraseñas no coinciden.'
        : '',
    };
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(e => e !== '')) {
      return mostrarToast('Corrige los errores antes de guardar.', false);
    }
    try {
      await api.put('/usuarios/mi-perfil', {
        ...form,
        Correo: perfil.Correo,
        Fecha_Nacimiento: perfil.Fecha_Nacimiento
      });
      mostrarToast('¡Perfil actualizado correctamente!');
      setModoEdicion(false);
      setErrores({});
      cargarPerfil();
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al actualizar el perfil.', false);
    }
  };

  const nombreRol = (codigo) => {
    if (codigo === 1) return { texto: 'Técnico',       color: '#0d6efd' };
    if (codigo === 2) return { texto: 'Cliente',        color: '#198754' };
    if (codigo === 3) return { texto: 'Administrador',  color: '#DC3545' };
    return               { texto: `Rol ${codigo}`,    color: '#6c757d' };
  };

  const inicial = (nombre) => nombre ? nombre.charAt(0).toUpperCase() : '?';

  const renderContenido = () => {
    if (cargando) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--color-primary)' }} role="status" />
          <p className="mt-3 text-muted">Cargando perfil...</p>
        </div>
      );
    }
    if (!perfil) {
      return <div className="text-center py-5"><h5 className="text-muted">No se pudo cargar el perfil.</h5></div>;
    }
    if (modoEdicion) {
      return <FormEdicion form={form} setForm={setForm} errores={errores} setErrores={setErrores} guardarCambios={guardarCambios} setModoEdicion={setModoEdicion} />;
    }
    return <VistaPerfil perfil={perfil} esPropioPeril={esPropioPeril} nombreRol={nombreRol} />;
  };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`} style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo={esPropioPeril ? 'CELUACCEL — Mi Perfil' : 'CELUACCEL — Perfil del Cliente'} cerrarSesion={cerrarSesion} />

      <div className="container mt-4" style={{ maxWidth: '800px' }}>
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
              <button className="btn btn-light fw-bold text-danger px-4" onClick={() => setModoEdicion(true)}>Editar Perfil</button>
            </div>
          )}
        </div>

        {renderContenido()}

        <div className="mt-4">
          <button className="btn btn-outline-secondary fw-bold" onClick={() => setVista(perfilObjetivoId ? 'servicios' : 'home')}>
            ← Volver
          </button>
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

export default Perfil;
