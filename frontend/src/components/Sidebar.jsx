import React from 'react';

const Sidebar = ({ setVista }) => {
  const role = Number(localStorage.getItem('role')) || 2;
  const currentVista = localStorage.getItem('ultimaVista') || 'home';

  const Btn = ({ label, vista }) => {
    const isActive = vista === currentVista;
    return (
      <button
        className={`btn text-start sidebar-btn w-100 ${isActive ? 'active' : ''}`}
        onClick={() => setVista(vista)}
        data-bs-dismiss="offcanvas"
      >
        {label}
      </button>
    );
  };

  const SectionLabel = ({ children }) => (
    <div className="sidebar-section-label mt-3 mb-1 px-1">{children}</div>
  );

  return (
    <div className="offcanvas-body">
      <div className="d-grid gap-1">

        {/* ── GENERAL ── */}
        <SectionLabel>General</SectionLabel>
        <Btn label="Inicio"      vista="home" />

        {/* ══ CLIENTE (Rol 2) ══ */}
        {role === 2 && (
          <>
            <SectionLabel>Mis Servicios</SectionLabel>
            <Btn label="Mis Servicios"       vista="miServicio" />
            <Btn label="Chat con Asesor"     vista="chatVista" />
            <Btn label="Mis Notificaciones"  vista="misNotificaciones" />
            <Btn label="Mis Preguntas"       vista="misPreguntas" />

            <SectionLabel>Tienda</SectionLabel>
            <Btn label="Catálogo"            vista="catalogo" />
            <Btn label="Comentarios"         vista="comentarios" />

            <SectionLabel>Cuenta</SectionLabel>
            <Btn label="Mi Perfil"           vista="perfil" />
          </>
        )}

        {/* ══ TÉCNICO / ADMIN (Roles 1 y 3) ══ */}
        {(role === 1 || role === 3) && (
          <>
            <SectionLabel>Operaciones</SectionLabel>
            <Btn label="Gestión de Servicios"    vista="servicios" />
            <Btn label="Chat de Soporte"         vista="chatVista" />
            <Btn label="Historial de Eventos"    vista="historial" />
            <Btn label="Notificaciones"          vista="notificaciones" />

            <SectionLabel>Catálogo e Inventario</SectionLabel>
            <Btn label="Gestión de Productos"    vista="productos" />
            <Btn label="Categorías"              vista="categorias" />
            <Btn label="Preguntas de Productos"  vista="preguntas" />
            <Btn label="Catálogo"                vista="catalogo" />
            <Btn label="Comentarios"             vista="comentarios" />
          </>
        )}

        {/* ══ SOLO ADMIN (Rol 3) ══ */}
        {role === 3 && (
          <>
            <SectionLabel>Administración</SectionLabel>
            <Btn label="Gestión de Usuarios"    vista="usuarios" />
            <Btn label="Tipos de Documento"     vista="tipo" />
            <Btn label="Roles"                  vista="roles" />
          </>
        )}

      </div>
    </div>
  );
};

export default Sidebar;
