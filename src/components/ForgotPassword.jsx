import React, { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword({ setVista }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });

  const mostrarToast = (msg, ok = false) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return mostrarToast('Por favor, ingresa tu correo.', false);

    setCargando(true);
    setMessage('');
    try {
      const res = await api.post('/forgot-password', { email: email.trim() });
      mostrarToast(res.data.message || 'Correo enviado para recuperar contraseña.', true);
      setMessage(res.data.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || 'Error al enviar el correo. Inténtalo de nuevo.';
      mostrarToast(errorMsg, false);
      setMessage(errorMsg);
    } finally {
      setCargando(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
      {/* TOAST */}
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <div className="card p-4 shadow-lg border-0" style={{ width: '390px' }}>
        <div className="text-center mb-4">
          <div className="fw-bold" style={{ color: 'var(--color-primary)', fontSize: '1.6rem', letterSpacing: '2px' }}>CELUACCEL</div>
          <p className="text-muted small mb-0 mt-1">Recuperar Contraseña</p>
          <hr className="mt-3 mb-0" style={{ borderColor: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <label className="form-label fw-bold small text-muted mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Ingresa tu correo registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            className="btn w-100 btn-primary py-2 mb-2"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Enviando...
              </>
            ) : (
              'Enviar Enlace'
            )}
          </button>
        </form>

        <button
          className="btn w-100 btn-outline-secondary"
          onClick={() => setVista('login')}
          disabled={cargando}
        >
          Volver al Login
        </button>

        {message && (
          <div className={`mt-3 p-2 rounded small text-center ${message.includes('Error') || message.includes('inválido') || message.includes('No existe') ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
