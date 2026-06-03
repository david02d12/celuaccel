import React from 'react';

const Navbar = ({ titulo, cerrarSesion, children }) => {
  // Leer información desde LocalStorage
  const usuario = localStorage.getItem('user') || '';
  const rolNum = Number(localStorage.getItem('role'));
  
  let rolNombre = '';
  if (rolNum === 1) rolNombre = 'Técnico';
  else if (rolNum === 2) rolNombre = 'Cliente';
  else if (rolNum === 3) rolNombre = 'Administrador';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark p-3 shadow-sm" style={{ backgroundColor: '#DB0000' }}>
      <div className="container">
        <button className="btn fw-bold text-white" style={{ backgroundColor: '#121212' }} type="button" data-bs-toggle="offcanvas" data-bs-target="#menuGlobal">
          MENÚ
        </button>
        <span 
          className="navbar-brand fw-bold ms-3" 
          style={{ cursor: 'pointer' }}
          title="Regresar al Panel Principal"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateHome'))}
        >
          {titulo}
        </span>
        
        <div className="d-flex ms-auto align-items-center gap-3">
          {usuario && (
            <div className="text-white text-end lh-1 d-none d-md-block">
              <div className="fw-bold fs-6">{usuario}</div>
              <small className="text-light" style={{ fontSize: '0.80rem' }}>{rolNombre}</small>
            </div>
          )}
          {children}
          {cerrarSesion && (
            <button className="btn btn-sm fw-bold text-white" style={{ backgroundColor: '#121212' }} onClick={cerrarSesion}>
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
