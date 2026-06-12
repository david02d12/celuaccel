import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ setLogueado, setModoRegistro, setVista }) => {
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [toast,     setToast]     = useState({ visible: false, msg: '', ok: true });
  const [cargando,  setCargando]  = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const mostrarToast = (msg, ok = false) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  const acceder = async () => {
    const u = loginUser.trim();
    const p = loginPass.trim();
    if (!u || !p) return mostrarToast('Por favor, completa todos los campos.', false);
    setCargando(true);
    try {
      const res = await api.post('/login', { user: u, password: p });
      if (res.data.auth) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user',  res.data.user);
        localStorage.setItem('role',  res.data.role);
        setLogueado(true);
      }
    } catch {
      mostrarToast('Usuario o contraseña incorrectos.', false);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = e => { if (e.key === 'Enter') acceder(); };

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      backgroundColor: 'var(--color-bg)',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Toast */}
      {toast.visible && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.ok ? '#198754' : '#c00000',
          color: '#fff', padding: '14px 20px', borderRadius: '12px',
          fontWeight: 600, fontSize: '0.88rem', minWidth: '260px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          animation: 'slideIn .3s ease',
        }}>
          <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
          {toast.msg}
        </div>
      )}

      {/* Mini navbar */}
      <nav style={{
        background: 'var(--navbar-bg)',
        padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
      }}>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '3px', color: '#fff' }}>
          CELUACCEL
        </span>
        <button
          onClick={() => setVista('catalogoPublico')}
          style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', padding: '6px 16px', borderRadius: '8px',
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
          }}
        >
          Ver Catálogo
        </button>
      </nav>

      {/* Card de login */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          backgroundColor: 'var(--color-surface)', borderRadius: '20px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}>
          {/* Franja superior */}
          <div style={{
            background: 'var(--navbar-bg)',
            padding: '28px 32px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: '4px' }}>
              Bienvenido de vuelta
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', margin: 0 }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <div style={{ padding: '32px' }}>
            {/* Campo: usuario */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--color-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Número de Documento
              </label>
              <input
                type="text"
                placeholder="Ej: 1001234567"
                value={loginUser}
                onChange={e => setLoginUser(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1.5px solid var(--color-border)', borderRadius: '10px',
                  fontSize: '0.92rem', outline: 'none',
                  transition: 'border-color .2s', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  ...inputStyle
                }}
              />
            </div>

            {/* Campo: contraseña */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--color-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px',
                    border: '1.5px solid var(--color-border)', borderRadius: '10px',
                    fontSize: '0.92rem', outline: 'none',
                    transition: 'border-color .2s', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    ...inputStyle
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {mostrarPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Botón principal */}
            <button
              onClick={acceder}
              disabled={cargando}
              style={{
                width: '100%', padding: '13px',
                background: cargando ? '#999' : 'var(--color-primary)',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontWeight: 700, fontSize: '0.95rem', cursor: cargando ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(192,0,0,0.15)',
                transition: 'opacity .2s', marginBottom: '12px',
              }}
            >
              {cargando
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
                      animation: 'spin .8s linear infinite',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    Verificando...
                  </span>
                : 'Ingresar al Sistema'
              }
            </button>

            {/* Links secundarios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setModoRegistro(true)}
                style={{ background: 'none', border: '1.5px solid var(--color-border)', color: 'var(--color-text)', padding: '11px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', width: '100%' }}
              >
                Crear cuenta nueva
              </button>
              <button
                onClick={() => setVista('forgotPassword')}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontWeight: 500, cursor: 'pointer', fontSize: '0.83rem', padding: '4px' }}
              >
                Olvidé mi contraseña
              </button>
              <div style={{ width: '100%', height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
              <button
                onClick={() => setVista('catalogoPublico')}
                style={{
                  background: 'var(--color-primary-lt)', border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)', padding: '10px', borderRadius: '10px',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem', width: '100%',
                }}
              >
                Ver catálogo sin iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;