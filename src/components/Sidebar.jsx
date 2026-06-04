import React from 'react';

const Sidebar = ({ setVista }) => {
  const role = Number(localStorage.getItem('role')) || 2;

  return (
    <div className="offcanvas-body">
      <div className="d-grid gap-3">
        {/* Inicio — accesible para todos */}
        <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('home')} data-bs-dismiss="offcanvas"> Inicio</button>

        {/* MÓDULOS EXCLUSIVOS DEL CLIENTE (Rol 2) */}
        {role === 2 && (
          <>
            <hr className="border-secondary" />
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('miServicio')} data-bs-dismiss="offcanvas"> Mis Servicios</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('chatVista')} data-bs-dismiss="offcanvas"> Chat con Asesor</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('misNotificaciones')} data-bs-dismiss="offcanvas"> Mis Notificaciones</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('catalogo')} data-bs-dismiss="offcanvas"> Catálogo</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('comentarios')} data-bs-dismiss="offcanvas"> Comentarios</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('perfil')} data-bs-dismiss="offcanvas"> Mi Perfil</button>
          </>
        )}


        {/* MÓDULOS DE TÉCNICO Y ADMINISTRADOR (Roles 1 y 3) */}
        {(role === 1 || role === 3) && (
          <>
            <hr className="border-secondary" />
            {/* Módulos de flujo principal */}
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('servicios')} data-bs-dismiss="offcanvas"> Gestión de Servicios</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('chatVista')} data-bs-dismiss="offcanvas"> Chat de Soporte</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('historial')} data-bs-dismiss="offcanvas"> Historial de Eventos</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('notificaciones')} data-bs-dismiss="offcanvas"> Notificaciones</button>

            <hr className="border-secondary" />
            {/* Catálogo e inventario */}
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('productos')} data-bs-dismiss="offcanvas"> Gestión de Productos</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('categorias')} data-bs-dismiss="offcanvas"> Categorías</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('preguntas')} data-bs-dismiss="offcanvas"> Preguntas de Productos</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('catalogo')} data-bs-dismiss="offcanvas"> Catálogo</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('comentarios')} data-bs-dismiss="offcanvas"> Comentarios</button>
          </>
        )}

        {/* MÓDULOS EXCLUSIVOS DEL ADMINISTRADOR (Rol 3) */}
        {role === 3 && (
          <>
            <hr className="border-secondary" />
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('usuarios')} data-bs-dismiss="offcanvas"> Gestión de Usuarios</button>
            <button className="btn text-white fw-bold text-start" style={{ backgroundColor: '#DB0000' }} onClick={() => setVista('tipo')} data-bs-dismiss="offcanvas"> Tipos de Documento</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
