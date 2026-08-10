import React, { useState, useEffect } from 'react';
import api from '../services/api';

// ── Límites de edad (mín 10 años, máx 80 años) ──────────────────────────────
const calcFechaLimites = () => {
  const hoy = new Date();
  const maxDate = new Date(hoy.getFullYear() - 10, hoy.getMonth(), hoy.getDate()).toISOString().split('T')[0];
  const minDate = new Date(hoy.getFullYear() - 80, hoy.getMonth(), hoy.getDate()).toISOString().split('T')[0];
  return { minDate, maxDate };
};

// ── Reglas de validación por tipo de documento ───────────────────────────────
const REGLAS_DOC = {
  '1': { nombre: 'Cédula',               min: 6,  max: 10, soloNumeros: true,  regex: /^\d{6,10}$/ },
  '2': { nombre: 'Tarjeta de Identidad', min: 10, max: 11, soloNumeros: true,  regex: /^\d{10,11}$/ },
  '3': { nombre: 'Cédula de Extranjería',min: 6,  max: 12, soloNumeros: false, regex: /^[A-Za-z0-9]{6,12}$/ },
  '4': { nombre: 'Pasaporte',            min: 5,  max: 15, soloNumeros: false, regex: /^[A-Za-z0-9]{5,15}$/ },
  '5': { nombre: 'PEP',                  min: 15, max: 17, soloNumeros: false, regex: /^[A-Za-z0-9]{15,17}$/ },
};

// ── Validaciones individuales ────────────────────────────────────────────────
const validarNombre = (nombre) => {
  if (!nombre.trim()) return 'El nombre completo es obligatorio.';
  const palabras = nombre.trim().split(/\s+/).filter(p => p.length >= 2);
  if (palabras.length < 2) return 'Ingresa mínimo 1 nombre y 1 apellido (ej: Juan Pérez).';
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']+$/.test(nombre.trim()))
    return 'El nombre solo puede contener letras, espacios y guiones.';
  return '';
};

const validarDocumento = (id, codTipo) => {
  const regla = REGLAS_DOC[String(codTipo)];
  if (!regla) return 'Selecciona un tipo de documento primero.';
  if (!id.trim()) return 'El número de documento es obligatorio.';
  if (!regla.regex.test(id.trim())) {
    return regla.soloNumeros
      ? `El número debe tener entre ${regla.min} y ${regla.max} dígitos numéricos.`
      : `El número debe tener entre ${regla.min} y ${regla.max} caracteres alfanuméricos.`;
  }
  return '';
};

const validarTelefono = (tel) => {
  if (!tel.trim()) return ''; // opcional, pero si se ingresa, se valida
  if (!/^\d+$/.test(tel.trim())) return 'El teléfono solo debe contener números.';
  if (tel.trim().length < 7) return `Mínimo 7 dígitos (actualmente ${tel.trim().length}).`;
  if (tel.trim().length > 10) return 'Máximo 10 dígitos.';
  return '';
};

const validarDireccion = (dir) => {
  if (!dir.trim()) return ''; // opcional
  if (dir.trim().length < 8) return `Mínimo 8 caracteres para una dirección válida (actualmente ${dir.trim().length}).`;
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(dir)) return 'La dirección debe contener texto (calle, carrera, etc.).';
  if (!/\d/.test(dir)) return 'La dirección debe contener al menos un número (ej: Calle 45 #12-30).';
  return '';
};

// ── Indicador fuerza de contraseña ───────────────────────────────────────────
const fuerzaClave = (clave) => {
  if (!clave) return { nivel: 0, texto: '', color: '' };
  let pts = 0;
  if (clave.length >= 6)  pts++;
  if (clave.length >= 10) pts++;
  if (/[A-Z]/.test(clave)) pts++;
  if (/[0-9]/.test(clave)) pts++;
  if (/[^A-Za-z0-9]/.test(clave)) pts++;
  if (pts <= 1) return { nivel: 1, texto: 'Débil',  color: '#dc3545' };
  if (pts <= 3) return { nivel: 2, texto: 'Media',  color: '#ffc107' };
  return             { nivel: 3, texto: 'Fuerte', color: '#198754' };
};

// ── Componente principal ─────────────────────────────────────────────────────
const Registro = ({ setModoRegistro, setVista }) => {
  const [formReg, setFormReg] = useState({
    ID_Usuario: '', Codigo_Documento: '', Nombre: '',
    Fecha_Nacimiento: '', Direccion: '', Telefono: '', Correo: '', Clave: ''
  });
  const [tiposDoc, setTiposDoc] = useState([]);
  const [toast, setToast]     = useState({ visible: false, msg: '', ok: true });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    setTiposDoc([
      { Codigo_Documento: 1, Tipo_Documento: 'Cédula de Ciudadanía' },
      { Codigo_Documento: 2, Tipo_Documento: 'Tarjeta de Identidad' },
      { Codigo_Documento: 3, Tipo_Documento: 'Cédula de Extranjería' },
      { Codigo_Documento: 4, Tipo_Documento: 'Pasaporte' },
      { Codigo_Documento: 5, Tipo_Documento: 'PEP' },
    ]);
  }, []);

  const { minDate, maxDate } = calcFechaLimites();
  const infoFuerza = fuerzaClave(formReg.Clave);

  const mostrarToast = (msg, ok) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  // Actualiza un campo y valida inline
  const actualizar = (campo, valor) => {
    const nuevo = { ...formReg, [campo]: valor };
    setFormReg(nuevo);

    // Validación reactiva por campo
    const errs = { ...errores };
    if (campo === 'Nombre')          errs.Nombre    = validarNombre(valor);
    if (campo === 'Telefono')        errs.Telefono  = validarTelefono(valor);
    if (campo === 'Direccion')       errs.Direccion = validarDireccion(valor);
    if (campo === 'ID_Usuario')      errs.ID_Usuario = validarDocumento(valor, nuevo.Codigo_Documento);
    if (campo === 'Codigo_Documento')errs.ID_Usuario = validarDocumento(nuevo.ID_Usuario, valor);
    if (campo === 'Correo') {
      const arrs = (valor.match(/@/g) || []).length;
      errs.Correo = arrs > 1 ? 'El correo debe tener exactamente un @.' : '';
    }
    setErrores(errs);
  };

  const registrarUsuario = async () => {
    // ── 1. Campos obligatorios
    if (!formReg.ID_Usuario || !formReg.Nombre || !formReg.Correo || !formReg.Clave || !formReg.Codigo_Documento) {
      mostrarToast('Por favor completa todos los campos obligatorios (*).', false);
      return;
    }

    // ── 2. Nombre: mín. 1 nombre + 1 apellido
    const errNombre = validarNombre(formReg.Nombre);
    if (errNombre) { mostrarToast(errNombre, false); return; }

    // ── 3. Documento según tipo
    const errDoc = validarDocumento(formReg.ID_Usuario, formReg.Codigo_Documento);
    if (errDoc) { mostrarToast(errDoc, false); return; }

    // ── 4. Teléfono (si fue ingresado)
    const errTel = validarTelefono(formReg.Telefono);
    if (errTel) { mostrarToast(errTel, false); return; }

    // ── 5. Dirección (si fue ingresada)
    const errDir = validarDireccion(formReg.Direccion);
    if (errDir) { mostrarToast(errDir, false); return; }

    // ── 6. Correo: exactamente un @
    const arrobas = (formReg.Correo.match(/@/g) || []).length;
    if (arrobas !== 1) { mostrarToast('El correo debe contener exactamente un símbolo @.', false); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formReg.Correo.trim())) {
      mostrarToast('Ingresa un correo válido (ej: usuario@dominio.com).', false); return;
    }

    // ── 7. Contraseña mín. 6 caracteres
    if (formReg.Clave.trim().length < 6) {
      mostrarToast('La contraseña debe tener mínimo 6 caracteres.', false); return;
    }

    // ── 8. Fecha de nacimiento (rango 10–80 años)
    if (formReg.Fecha_Nacimiento) {
      const parts = formReg.Fecha_Nacimiento.split('-');
      if (parts.length === 3) {
        const dateNac   = new Date(parts[0], parts[1] - 1, parts[2]);
        const hoy       = new Date(); hoy.setHours(0, 0, 0, 0);
        const edadAnios = (hoy - dateNac) / (1000 * 60 * 60 * 24 * 365.25);
        if (dateNac >= hoy)   { mostrarToast('La fecha debe estar en el pasado.', false); return; }
        if (edadAnios < 10)   { mostrarToast('Debes tener al menos 10 años para registrarte.', false); return; }
        if (edadAnios > 80)   { mostrarToast('La edad máxima permitida es 80 años.', false); return; }
      }
    }

    try {
      await api.post('/registro', {
        ...formReg,
        ID_Usuario: formReg.ID_Usuario.trim(),
        Correo:     formReg.Correo.trim(),
        Clave:      formReg.Clave.trim()
      });
      mostrarToast('¡Registro exitoso! Ya puedes iniciar sesión.', true);
      setTimeout(() => {
        if (setModoRegistro) setModoRegistro(false);
        if (setVista)        setVista('login');
      }, 2000);
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al registrar el usuario.', false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  // Regla activa del tipo de documento seleccionado
  const reglaDoc = REGLAS_DOC[String(formReg.Codigo_Documento)] || null;

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      {/* TOAST */}
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '300px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <div className="card p-4 mx-auto shadow-lg border-0" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold">Registro en Celuaccel</h4>
          <p className="text-muted small">Crea tu cuenta para acceder al sistema</p>
        </div>

        {/* ── Número de documento ─────────────────── */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">
            Número de Identificación *
            {reglaDoc && (
              <span className="fw-normal ms-1" style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                ({reglaDoc.soloNumeros ? `${reglaDoc.min}–${reglaDoc.max} dígitos` : `${reglaDoc.min}–${reglaDoc.max} caracteres`})
              </span>
            )}
          </label>
          <input
            className={`form-control ${errores.ID_Usuario ? 'is-invalid' : formReg.ID_Usuario && !errores.ID_Usuario ? 'is-valid' : ''}`}
            style={inputStyle}
            placeholder={reglaDoc ? (reglaDoc.soloNumeros ? `Ej: ${'0'.repeat(reglaDoc.min)}` : `Ej: AB${reglaDoc.min}01`) : 'Ej: 1001234567'}
            value={formReg.ID_Usuario}
            onChange={e => {
              const v = e.target.value;
              const regla = REGLAS_DOC[String(formReg.Codigo_Documento)];
              // Si es solo números, filtrar letras en tiempo real
              if (regla?.soloNumeros && /[^0-9]/.test(v)) return;
              actualizar('ID_Usuario', v);
            }}
          />
          {errores.ID_Usuario && <small className="text-danger">{errores.ID_Usuario}</small>}
        </div>

        {/* ── Tipo de documento ───────────────────── */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Tipo de Documento *</label>
          <select className="form-select" style={inputStyle} value={formReg.Codigo_Documento}
            onChange={e => actualizar('Codigo_Documento', e.target.value)}>
            <option value="">Seleccione un tipo...</option>
            {tiposDoc.map(t => (
              <option key={t.Codigo_Documento} value={t.Codigo_Documento}>{t.Tipo_Documento}</option>
            ))}
          </select>
        </div>

        {/* ── Nombre completo ─────────────────────── */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">
            Nombre Completo *
            <span className="fw-normal ms-1" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              (mín. 1 nombre y 1 apellido)
            </span>
          </label>
          <input
            className={`form-control ${errores.Nombre ? 'is-invalid' : formReg.Nombre && !errores.Nombre ? 'is-valid' : ''}`}
            style={inputStyle}
            placeholder="Ej: Juan Carlos Pérez"
            value={formReg.Nombre}
            onChange={e => actualizar('Nombre', e.target.value)}
          />
          {errores.Nombre && <small className="text-danger">{errores.Nombre}</small>}
        </div>

        {/* ── Fecha de nacimiento ─────────────────── */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">
            Fecha de Nacimiento
            <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.72rem' }}>(entre 10 y 80 años)</span>
          </label>
          <input className="form-control" style={inputStyle} type="date"
            min={minDate}
            max={maxDate}
            value={formReg.Fecha_Nacimiento}
            onChange={e => setFormReg({ ...formReg, Fecha_Nacimiento: e.target.value })} />
        </div>

        {/* ── Dirección y teléfono ────────────────── */}
        <div className="row mb-3">
          <div className="col-7">
            <label className="form-label fw-bold small text-muted">
              Dirección
              <span className="fw-normal ms-1" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>(mín. 8 car.)</span>
            </label>
            <input
              className={`form-control ${errores.Direccion ? 'is-invalid' : formReg.Direccion && !errores.Direccion ? 'is-valid' : ''}`}
              style={inputStyle}
              placeholder="Calle 45 #12-30"
              value={formReg.Direccion}
              onChange={e => actualizar('Direccion', e.target.value)}
            />
            {errores.Direccion && <small className="text-danger d-block">{errores.Direccion}</small>}
          </div>
          <div className="col-5">
            <label className="form-label fw-bold small text-muted">
              Teléfono
              <span className="fw-normal ms-1" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>(7–10 díg.)</span>
            </label>
            <input
              className={`form-control ${errores.Telefono ? 'is-invalid' : formReg.Telefono && !errores.Telefono ? 'is-valid' : ''}`}
              style={inputStyle}
              placeholder="3001234567"
              value={formReg.Telefono}
              onChange={e => {
                // Solo permitir dígitos
                const v = e.target.value.replace(/[^0-9]/g, '');
                actualizar('Telefono', v);
              }}
              maxLength={10}
            />
            {errores.Telefono && <small className="text-danger d-block">{errores.Telefono}</small>}
          </div>
        </div>

        {/* ── Correo ─────────────────────────────── */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Correo Electrónico *</label>
          <input
            className={`form-control ${errores.Correo ? 'is-invalid' : formReg.Correo && !errores.Correo ? 'is-valid' : ''}`}
            style={inputStyle}
            type="text"
            placeholder="correo@ejemplo.com"
            value={formReg.Correo}
            onChange={e => {
              const val = e.target.value;
              const arrobas = (val.match(/@/g) || []).length;
              if (arrobas <= 1) actualizar('Correo', val);
            }}
          />
          {errores.Correo
            ? <small className="text-danger">{errores.Correo}</small>
            : formReg.Correo && (formReg.Correo.match(/@/g) || []).length !== 1 && (
              <small className="text-danger">El correo debe contener exactamente un @</small>
            )
          }
        </div>

        {/* ── Contraseña ──────────────────────────── */}
        <div className="mb-4">
          <label className="form-label fw-bold small text-muted">Contraseña *</label>
          <input
            className={`form-control ${formReg.Clave && formReg.Clave.length < 6 ? 'is-invalid' : formReg.Clave && formReg.Clave.length >= 6 ? 'is-valid' : ''}`}
            style={inputStyle}
            type="password"
            placeholder="Mín. 6 caracteres"
            value={formReg.Clave}
            onChange={e => setFormReg({ ...formReg, Clave: e.target.value })}
          />
          {formReg.Clave.length > 0 && (
            <div className="mt-2">
              <div className="d-flex gap-1 mb-1">
                {[1, 2, 3].map(n => (
                  <div key={n} style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    backgroundColor: infoFuerza.nivel >= n ? infoFuerza.color : 'var(--color-border)',
                    transition: 'background-color .3s'
                  }} />
                ))}
              </div>
              <small style={{ color: infoFuerza.color, fontWeight: 600 }}>
                {formReg.Clave.length < 6
                  ? `Mínimo 6 caracteres (faltan ${6 - formReg.Clave.length})`
                  : `Contraseña ${infoFuerza.texto}`
                }
              </small>
            </div>
          )}
        </div>

        <button className="btn w-100 btn-primary py-2 mb-2" onClick={registrarUsuario}>
          Crear Cuenta
        </button>
        <button className="btn btn-outline-secondary w-100"
          onClick={() => {
            if (setModoRegistro) setModoRegistro(false);
            if (setVista) setVista('login');
          }}>
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default Registro;