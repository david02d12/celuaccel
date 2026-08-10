import React from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ChatLista from './ChatLista';
import ChatMensajes from './ChatMensajes';
import { useChatView } from './useChatView';

const MobileHeader = ({ panelAbierto, setPanelAbierto }) => (
  <div className="d-md-none px-3 pt-2 pb-1 border-bottom" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
    <button className="btn btn-sm btn-primary w-100" onClick={() => setPanelAbierto(v => !v)}>
      {panelAbierto ? 'Cerrar conversaciones' : 'Ver conversaciones'}
    </button>
  </div>
);

const SidebarMenu = ({ setVista }) => (
  <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
    <div className="offcanvas-header">
      <h5 className="offcanvas-title fw-bold">Menú de Navegación</h5>
      <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <Sidebar setVista={setVista} />
  </div>
);

const ChatVista = ({ cerrarSesion, setVista }) => {
  const usuario = sessionStorage.getItem('user') || 'Usuario';
  const nombre = sessionStorage.getItem('nombre') || usuario;
  const role = Number(sessionStorage.getItem('role')) || 2;

  const chatProps = useChatView(role, usuario);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar titulo="CELUACCEL — Soporte en Línea" cerrarSesion={cerrarSesion} />
      
      <MobileHeader panelAbierto={chatProps.panelAbierto} setPanelAbierto={chatProps.setPanelAbierto} />

      {/* CUERPO DEL CHAT */}
      <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
        {/* PANEL IZQUIERDO: LISTA DE CHATS */}
        <ChatLista role={role} setVista={setVista} {...chatProps} />

        {/* PANEL DERECHO: CONVERSACIÓN */}
        <ChatMensajes role={role} usuario={usuario} nombre={nombre} {...chatProps} />
      </div>

      {/* MENÚ LATERAL */}
      <SidebarMenu setVista={setVista} />
    </div>
  );
};

export default ChatVista;
