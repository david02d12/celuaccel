import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Registro = ({ setModoRegistro, setVista }) => {
  const [formReg, setFormReg] = useState({
    ID_Usuario: '', Codigo_Documento: '', Nombre: '',
    Fecha_Nacimiento: '', Direccion: '', Telefono: '', Correo: '', Clave: ''
  });
  const [tiposDoc, setTiposDoc] = useState([]);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });

  useEffect(() => {
    setTiposDoc([
      { Codigo_Documento: 1, Nombre_Documento: 'Cédula' },
      { Codigo_Documento: 2, Nombre_Documento: 'Tarjeta de Identidad' },
      { Codigo_Documento: 3, Nombre_Documento: 'Cédula de Extranjería' },
      { Codigo_Documento: 4, Nombre_Documento: 'Pasaporte' },
      { Codigo_Documento: 5, Nombre_Documento: 'PEP' },
    ]);
  }, []);

  const mostrarToast = (msg, ok) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  const registrarUsuario = async () => {
    if (!formReg.ID_Usuario || !formReg.Nombre || !formReg.Correo || !formReg.Clave || !formReg.Codigo_Documento) {
      mostrarToast('Por favor completa todos los campos obligatorios.', false);
      return;
    }

    if (formReg.Fecha_Nacimiento) {
      const parts = formReg.Fecha_Nacimiento.split('-');
      if (parts.length === 3) {
        const dateNacLocal = new Date(parts[0], parts[1] - 1, parts[2]);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (dateNacLocal >= hoy) {
          mostrarToast('La fecha de nacimiento debe ser válida y estar en el pasado.', false);
          return;
        }
      }
    }

    try {
      await api.post('/registro', {
        ...formReg,
        ID_Usuario: formReg.ID_Usuario.trim(),
        Clave: formReg.Clave.trim()
      });
      mostrarToast('Registro exitoso. Ya puedes iniciar sesión.', true);
      setTimeout(() => {
        if (setModoRegistro) setModoRegistro(false);
        if (setVista) setVista('login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar el usuario.';
      mostrarToast(msg, false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      {/* TOAST */}
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <div className="card p-4 mx-auto shadow-lg border-0" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold">Registro en Celuaccel</h4>
          <p className="text-muted small">Crea tu cuenta para acceder al sistema</p>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Número de Identificación *</label>
          <input className="form-control" style={inputStyle} placeholder="Ej: 1001234567"
            value={formReg.ID_Usuario}
            onChange={e => setFormReg({ ...formReg, ID_Usuario: e.target.value })} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Tipo de Documento *</label>
          <select className="form-select" style={inputStyle} value={formReg.Codigo_Documento}
            onChange={e => setFormReg({ ...formReg, Codigo_Documento: e.target.value })}>
            <option value="">Seleccione un tipo...</option>
            {tiposDoc.map(t => (
              <option key={t.Codigo_Documento} value={t.Codigo_Documento}>{t.Nombre_Documento}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Nombre Completo *</label>
          <input className="form-control" style={inputStyle} placeholder="Ej: Juan Pérez"
            value={formReg.Nombre}
            onChange={e => setFormReg({ ...formReg, Nombre: e.target.value })} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Fecha de Nacimiento</label>
          <input className="form-control" style={inputStyle} type="date"
            max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
            value={formReg.Fecha_Nacimiento}
            onChange={e => setFormReg({ ...formReg, Fecha_Nacimiento: e.target.value })} />
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label fw-bold small text-muted">Dirección</label>
            <input className="form-control" style={inputStyle} placeholder="Calle 45 #12-30"
              value={formReg.Direccion}
              onChange={e => setFormReg({ ...formReg, Direccion: e.target.value })} />
          </div>
          <div className="col-6">
            <label className="form-label fw-bold small text-muted">Teléfono</label>
            <input className="form-control" style={inputStyle} placeholder="3001234567"
              value={formReg.Telefono}
              onChange={e => setFormReg({ ...formReg, Telefono: e.target.value })} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">Correo Electrónico *</label>
          <input className="form-control" style={inputStyle} type="email" placeholder="correo@ejemplo.com"
            value={formReg.Correo}
            onChange={e => setFormReg({ ...formReg, Correo: e.target.value })} />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-muted">Contraseña *</label>
          <input className="form-control" style={inputStyle} type="password" placeholder="Mín. 6 caracteres"
            value={formReg.Clave}
            onChange={e => setFormReg({ ...formReg, Clave: e.target.value })} />
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