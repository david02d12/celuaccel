import React from 'react';
import { useRegistroForm } from '../hooks/useRegistroForm';

const Registro = ({ setModoRegistro, setVista }) => {
  const {
    formReg,
    tiposDoc,
    toast,
    errores,
    minDate,
    maxDate,
    infoFuerza,
    reglaDoc,
    actualizar,
    registrarUsuario
  } = useRegistroForm(setModoRegistro, setVista);

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
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

        {/* Tipo de documento — va primero para que el hint del número cambie dinámicamente */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Tipo de Documento *</label>
          <select id="reg-tipo-doc" className="form-select" style={inputStyle} value={formReg.Codigo_Documento}
            onChange={e => actualizar('Codigo_Documento', e.target.value)}>
            <option value="">Seleccione un tipo...</option>
            {tiposDoc.map(t => (
              <option key={t.Codigo_Documento} value={t.Codigo_Documento}>{t.Tipo_Documento}</option>
            ))}
          </select>
        </div>

        {/* Número de identificación — el placeholder se adapta al tipo seleccionado */}
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
            id="reg-id-usuario"
            className={`form-control ${errores.ID_Usuario ? 'is-invalid' : formReg.ID_Usuario && !errores.ID_Usuario ? 'is-valid' : ''}`}
            style={inputStyle}
            placeholder={reglaDoc ? (reglaDoc.soloNumeros ? `Ej: ${'0'.repeat(reglaDoc.min)}` : `Ej: AB${reglaDoc.min}01`) : 'Ej: 1001234567'}
            value={formReg.ID_Usuario}
            maxLength={25}
            onChange={e => {
              const v = e.target.value;
              if (reglaDoc?.soloNumeros && /[^0-9]/.test(v)) return;
              actualizar('ID_Usuario', v);
            }}
          />
          {errores.ID_Usuario && <small className="text-danger">{errores.ID_Usuario}</small>}
        </div>

        {/* Nombres — máx 3 nombres */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">
            Nombres * <span className="fw-normal" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>(máx. 3 nombres)</span>
          </label>
          <input id="reg-nombres"
            className={`form-control ${errores.Nombres ? 'is-invalid' : formReg.Nombres && !errores.Nombres ? 'is-valid' : ''}`}
            style={inputStyle}
            placeholder="Ej: Juan Carlos"
            value={formReg.Nombres}
            maxLength={25}
            onChange={e => actualizar('Nombres', e.target.value)} />
          {errores.Nombres && <small className="text-danger">{errores.Nombres}</small>}
        </div>

        {/* Apellidos — máx 2 apellidos */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">
            Apellidos * <span className="fw-normal" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>(máx. 2 apellidos)</span>
          </label>
          <input id="reg-apellidos"
            className={`form-control ${errores.Apellidos ? 'is-invalid' : formReg.Apellidos && !errores.Apellidos ? 'is-valid' : ''}`}
            style={inputStyle}
            placeholder="Ej: Pérez Rodríguez"
            value={formReg.Apellidos}
            maxLength={25}
            onChange={e => actualizar('Apellidos', e.target.value)} />
          {errores.Apellidos && <small className="text-danger">{errores.Apellidos}</small>}
        </div>


        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Correo Electrónico *</label>
          <input id="reg-correo" type="email" className={`form-control ${errores.Correo ? 'is-invalid' : formReg.Correo && !errores.Correo ? 'is-valid' : ''}`}
            style={inputStyle} placeholder="ejemplo@correo.com" value={formReg.Correo}
            maxLength={25}
            onChange={e => actualizar('Correo', e.target.value)} />
          {errores.Correo && <small className="text-danger">{errores.Correo}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Fecha de Nacimiento <span className="fw-normal">(Opcional)</span></label>
          <input type="date" className="form-control" style={inputStyle}
            min={minDate} max={maxDate} value={formReg.Fecha_Nacimiento}
            onChange={e => actualizar('Fecha_Nacimiento', e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Dirección <span className="fw-normal">(Opcional)</span></label>
          <input className={`form-control ${errores.Direccion ? 'is-invalid' : formReg.Direccion && !errores.Direccion ? 'is-valid' : ''}`}
            style={inputStyle} placeholder="Ej: Calle 45 #12-30" value={formReg.Direccion}
            maxLength={25}
            onChange={e => actualizar('Direccion', e.target.value)} />
          {errores.Direccion && <small className="text-danger">{errores.Direccion}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Teléfono <span className="fw-normal">(Opcional)</span></label>
          <input type="tel" className={`form-control ${errores.Telefono ? 'is-invalid' : formReg.Telefono && !errores.Telefono ? 'is-valid' : ''}`}
            style={inputStyle} placeholder="Ej: 3001234567" value={formReg.Telefono}
            maxLength={25}
            onChange={e => { if (!/[^0-9]/.test(e.target.value)) actualizar('Telefono', e.target.value); }} />
          {errores.Telefono && <small className="text-danger">{errores.Telefono}</small>}
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-muted">
            Contraseña * <span className="fw-normal text-muted" style={{ fontSize: '0.75rem' }}>(6-15 caracteres)</span>
          </label>
          <input id="reg-clave" type="password"
            className="form-control"
            style={{ ...inputStyle, borderColor: formReg.Clave ? infoFuerza.color : 'var(--color-border)' }}
            placeholder="Mínimo 6 caracteres" value={formReg.Clave}
            maxLength={15}
            onChange={e => actualizar('Clave', e.target.value)} />
          {formReg.Clave && (
            <div className="mt-1 d-flex justify-content-between align-items-center">
              <small style={{ color: infoFuerza.color, fontWeight: 'bold' }}>{infoFuerza.texto}</small>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{
                    width: '30px', height: '4px', borderRadius: '2px',
                    backgroundColor: n <= infoFuerza.nivel ? infoFuerza.color : '#e9ecef'
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-muted">
            Confirmar Contraseña *
          </label>
          <input id="reg-clave-confirm" type="password"
            className={`form-control ${
              formReg.ClaveConfirm
                ? formReg.Clave.trim() === formReg.ClaveConfirm.trim()
                  ? 'is-valid'
                  : 'is-invalid'
                : ''
            }`}
            style={inputStyle}
            placeholder="Repite tu contraseña"
            value={formReg.ClaveConfirm}
            maxLength={15}
            onChange={e => actualizar('ClaveConfirm', e.target.value)}
          />
          {formReg.ClaveConfirm && formReg.Clave.trim() !== formReg.ClaveConfirm.trim() && (
            <small className="text-danger">Las contraseñas no coinciden.</small>
          )}
          {formReg.ClaveConfirm && formReg.Clave.trim() === formReg.ClaveConfirm.trim() && (
            <small className="text-success">✓ Las contraseñas coinciden.</small>
          )}
        </div>

        <button id="btn-registrar" className="btn btn-primary w-100 fw-bold py-2 mb-3 shadow-sm" onClick={registrarUsuario}>
          <svg width="20" height="20" className="me-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Crear Cuenta
        </button>

        <div className="text-center">
          <span className="text-muted small">¿Ya tienes cuenta? </span>
          <button id="btn-ir-login" className="btn btn-link p-0 fw-bold small text-decoration-none"
            onClick={() => {
              if (setModoRegistro) setModoRegistro(false);
              if (setVista) setVista('login');
            }}>
            Inicia Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registro;