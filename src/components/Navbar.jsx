import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ titulo, cerrarSesion, children }) => {
  const { isDark, toggleTheme } = useTheme();
  const usuario  = localStorage.getItem('user') || '';
  const rolNum   = Number(localStorage.getItem('role'));

  let rolNombre = '';
  if (rolNum === 1) rolNombre = 'Técnico';
  else if (rolNum === 2) rolNombre = 'Cliente';
  else if (rolNum === 3) rolNombre = 'Administrador';

  // Inicial del usuario para el avatar
  const inicial = usuario ? usuario.charAt(0).toUpperCase() : '?';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark p-3 shadow-sm">
      <div className="container">
        {/* Botón menú lateral */}
        <button
          className="btn btn-outline-light fw-bold"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#menuGlobal"
          aria-label="Abrir menú"
        >
          Menú
        </button>

        {/* Logotipo / Título (click → Home) */}
        <span
          className="navbar-brand fw-bold ms-3"
          style={{ cursor: 'pointer', letterSpacing: '-0.01em' }}
          title="Regresar al Panel Principal"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateHome'))}
        >
          {titulo}
        </span>

        {/* Zona derecha */}
        <div className="d-flex ms-auto align-items-center gap-3">
          {children}

          {/* Toggle de Modo Claro/Oscuro */}
          <button
            className="btn btn-link text-white p-2"
            onClick={toggleTheme}
            title={isDark ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
            style={{ textDecoration: 'none', boxShadow: 'none' }}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.794 3.148a.217.217 0 0 1 .412-.02A7.001 7.001 0 0 0 15.71 10.1a7.002 7.002 0 0 1-10.457-7.002 5.495 5.495 0 0 1 5.541-2.95zm-2.823 8.7a8.2 8.2 0 0 1-5.23-5.23A6 6 0 1 0 11.23 11.23a8.2 8.2 0 0 1-3.26-.082z"/>
              </svg>
            )}
          </button>

          {/* Avatar + info de usuario */}
          {usuario && (
            <div className="d-flex align-items-center gap-2" title={`${usuario} · ${rolNombre}`}>
              {/* Info texto (solo desktop) */}
              <div className="text-white text-end lh-1 d-none d-md-block">
                <div className="fw-bold" style={{ fontSize: '0.88rem' }}>{usuario}</div>
                <small className="text-light" style={{ fontSize: '0.75rem', opacity: 0.85 }}>{rolNombre}</small>
              </div>
              {/* Avatar circular */}
              <div className="user-avatar">{inicial}</div>
            </div>
          )}

          {/* Botón cerrar sesión */}
          {cerrarSesion && (
            <button
              className="btn btn-sm btn-outline-light fw-bold ms-1"
              onClick={cerrarSesion}
              title="Cerrar Sesión"
            >
              Salir
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
