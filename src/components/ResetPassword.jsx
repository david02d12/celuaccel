import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ResetPassword({ setVista }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });

  const mostrarToast = (msg, ok = false) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 4000);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) {
      mostrarToast('Token inválido o ausente en el enlace.', false);
      setMessage('El enlace de recuperación es inválido o no contiene un token.');
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      return mostrarToast('No hay un token válido para procesar el restablecimiento.', false);
    }
    if (!password.trim()) {
      return mostrarToast('Por favor, ingresa una nueva contraseña.', false);
    }

    setCargando(true);
    setMessage('');
    try {
      const res = await api.post(`/reset-password/${token}`, {
        newPassword: password.trim(),
      });

      mostrarToast(res.data.message || 'Contraseña restablecida con éxito.', true);
      setMessage('Tu contraseña ha sido restablecida. Redirigiendo al login...');

      window.history.replaceState({}, document.title, window.location.pathname);

      setTimeout(() => {
        setVista('home');
      }, 2500);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || 'Error al restablecer la contraseña.';
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
          <p className="text-muted small mb-0 mt-1">Nueva Contraseña</p>
          <hr className="mt-3 mb-0" style={{ borderColor: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <label className="form-label fw-bold small text-muted mb-1">
            Nueva Contraseña
          </label>
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Ingresa tu nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={cargando || !token}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            className="btn w-100 btn-primary py-2 mb-2"
            disabled={cargando || !token}
          >
            {cargando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Guardando...
              </>
            ) : (
              'Guardar Contraseña'
            )}
          </button>
        </form>

        <button
          className="btn w-100 btn-outline-secondary"
          onClick={() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            setVista('home');
          }}
          disabled={cargando}
        >
          Ir al Login
        </button>

        {message && (
          <div className={`mt-3 p-2 rounded small text-center ${message.includes('Error') || message.includes('inválido') || message.includes('No hay') ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
