import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Sidebar = ({ setVista }) => {
  const role = Number(sessionStorage.getItem('role')) || 2;
  const currentVista = sessionStorage.getItem('ultimaVista') || 'home';
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/mensajes/no-leidos');
        if (res.data && typeof res.data.total === 'number') {
          setUnreadChat(res.data.total);
        }
      } catch (err) {
        // ignore errors silently for polling
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const Btn = ({ label, vista, badge }) => {
    const isActive = vista === currentVista;
    return (
      <button
        id={`nav-${vista}`}
        className={`btn text-start sidebar-btn w-100 d-flex align-items-center justify-content-between ${isActive ? 'active' : ''}`}
        onClick={() => setVista(vista)}
        data-bs-dismiss="offcanvas"
      >
        <span>{label}</span>
        {badge > 0 && (
          <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.7rem' }}>
            {badge > 99 ? '+99' : badge}
          </span>
        )}
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
            <Btn label="Chat con Asesor"     vista="chatVista" badge={unreadChat} />
            <Btn label="Mis Notificaciones"  vista="misNotificaciones" />
            <Btn label="Mis Preguntas"       vista="misPreguntas" />

            <SectionLabel>Tienda</SectionLabel>
            <Btn label="Catálogo"            vista="catalogo" />
            <Btn label="Comentarios"         vista="comentarios" />
          </>
        )}

        {/* ══ TÉCNICO / ADMIN (Roles 1 y 3) ══ */}
        {(role === 1 || role === 3) && (
          <>
            <SectionLabel>Operaciones</SectionLabel>
            <Btn label="Gestión de Servicios"    vista="servicios" />
            <Btn label="Chat de Soporte"         vista="chatVista" badge={unreadChat} />
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

        {/* ══ CUENTA (Todos los roles) ══ */}
        <SectionLabel>Cuenta</SectionLabel>
        <Btn label="Mi Perfil"           vista="perfil" />

      </div>
    </div>
  );
};

export default Sidebar;
