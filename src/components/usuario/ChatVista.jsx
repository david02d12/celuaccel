import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ChatVista = ({ cerrarSesion, setVista }) => {
  const [chats, setChats] = useState([]);
  const [chatSel, setChatSel] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [busquedaChat, setBusquedaChat] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoChats, setCargandoChats] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [iniciandoChat, setIniciandoChat] = useState(null); // ID servicio en proceso
  const [panelAbierto, setPanelAbierto] = useState(false);
  const mensajesEndRef = useRef(null);
  const usuario = localStorage.getItem('user') || 'Usuario';
  const role = Number(localStorage.getItem('role')) || 2;

  useEffect(() => {
    cargarChats();
  }, []);

  useEffect(() => {
    if (chatSel) cargarMensajes(chatSel.Codigo_Chat);
  }, [chatSel]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const cargarChats = async () => {
    setCargandoChats(true);
    try {
      // Clientes: solo sus chats; Técnico/Admin: todos los chats
      const url = role === 2
        ? '/chats/listar-mios'
        : '/chats/listar';

      const res = await api.get(url);
      let chatsCargados = res.data;

      // Enlace Automático desde Servicios, MiServicio o Catalogo
      const chatInfoRaw = localStorage.getItem('chatInfo');
      if (chatInfoRaw) {
        const info = JSON.parse(chatInfoRaw);

        // Caso 1: Chat de catálogo → viene con Codigo_Chat directo
        if (info.Codigo_Chat) {
          const chatExistente = chatsCargados.find(c => String(c.Codigo_Chat) === String(info.Codigo_Chat));
          if (chatExistente) {
            setChatSel(chatExistente);
          }
          localStorage.removeItem('chatInfo');
        }
        // Caso 2: Chat de servicio → viene con ID_Servicio
        else if (info.ID_Servicio) {
          let chatExistente = chatsCargados.find(c => String(c.ID_Servicio) === String(info.ID_Servicio));

          if (chatExistente) {
            setChatSel(chatExistente);
          } else if (role === 2) {
            // Solo clientes auto-crean el chat
            const payload = { ID_Usuario: usuario, ID_Servicio: info.ID_Servicio };
            await api.post('/chats/agregar', payload);

            const resUpdated = await api.get(url);
            chatsCargados = resUpdated.data;
            chatExistente = chatsCargados.find(c => String(c.ID_Servicio) === String(info.ID_Servicio));
            if (chatExistente) setChatSel(chatExistente);
          }
          localStorage.removeItem('chatInfo');
        }
      }

      setChats(chatsCargados);

      // Si el cliente no tiene chats, ofrecer sus servicios como punto de partida
      if (chatsCargados.length === 0 && role === 2) {
        const resSvc = await api.get(`/servicios/mis-servicios/${usuario}`);
        const activos = resSvc.data.filter(s => Number(s.Etapa) !== -1);
        setServicios(activos);
      }
    } catch (err) {
      console.error('Error al cargar chats:', err);
    } finally {
      setCargandoChats(false);
    }
  };

  const iniciarChatDesdeServicio = async (idServicio) => {
    setIniciandoChat(idServicio);
    try {
      let chatExistente = chats.find(c => String(c.ID_Servicio) === String(idServicio));
      if (!chatExistente) {
        await api.post('/chats/agregar', { ID_Usuario: usuario, ID_Servicio: idServicio });
        const res = await api.get('/chats/listar-mios');
        setChats(res.data);
        chatExistente = res.data.find(c => String(c.ID_Servicio) === String(idServicio));
        setServicios([]); // ocultar panel de servicios al tener chats
      }
      if (chatExistente) setChatSel(chatExistente);
    } catch (err) {
      alert('Error al iniciar el chat. Intenta de nuevo.');
    } finally {
      setIniciandoChat(null);
    }
  };

  const cargarMensajes = async (codigoChat) => {
    try {
      setCargando(true);
      const res = await api.get(`/mensajes/por-chat/${codigoChat}`);
      setMensajes(res.data);
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    } finally {
      setCargando(false);
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !chatSel) return;

    const payload = {
      Codigo_Chat: chatSel.Codigo_Chat,
      ID_Usuario: usuario,
      Mensaje: nuevoMensaje.trim(),
      Estado: 'Enviado',
    };

    try {
      await api.post('/mensajes/agregar', payload);
      setNuevoMensaje('');
      cargarMensajes(chatSel.Codigo_Chat);
    } catch (err) {
      alert('Error al enviar el mensaje. Verifica que los campos sean correctos.');
    }
  };

  const eliminarMensaje = async (id) => {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.delete(`/mensajes/eliminar/${id}`);
      cargarMensajes(chatSel.Codigo_Chat);
    } catch (err) {
      alert('Error al eliminar el mensaje.');
    }
  };

  const chatsFiltrados = chats.filter(c =>
    String(c.Codigo_Chat).includes(busquedaChat) ||
    String(c.ID_Servicio).includes(busquedaChat) ||
    String(c.ID_Usuario).toLowerCase().includes(busquedaChat.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar titulo="CELUACCEL — Soporte en Línea" cerrarSesion={cerrarSesion} />

      {/* Botón para abrir panel en móvil */}
      <div className="d-md-none px-3 pt-2 pb-1 border-bottom" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <button
          className="btn btn-sm btn-primary w-100"
          onClick={() => setPanelAbierto(v => !v)}
        >
          {panelAbierto ? 'Cerrar conversaciones' : 'Ver conversaciones'}
        </button>
      </div>

      {/* CUERPO DEL CHAT */}
      <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>

        {/* PANEL IZQUIERDO: LISTA DE CHATS */}
        <div
          className={`d-flex flex-column border-end ${panelAbierto ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ 
            width: '300px', 
            minWidth: '260px', 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)',
            flexShrink: 0 
          }}
        >
          <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
            <p className="fw-bold mb-2 small text-muted">
              {role === 2 ? 'Mis Conversaciones' : 'Conversaciones Abiertas'}
            </p>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar chat (ID o Servicio)..."
              value={busquedaChat}
              onChange={e => setBusquedaChat(e.target.value)}
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ overflowY: 'auto', flexGrow: 1 }}>
            {cargandoChats ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm" style={{ color: 'var(--color-primary)' }} />
                <p className="text-muted small mt-2">Cargando conversaciones...</p>
              </div>
            ) : chatsFiltrados.length === 0 ? (
              <div className="text-center p-3">
                {role === 2 && servicios.length > 0 ? (
                  <>
                    <p className="text-muted small mb-3">Selecciona un servicio para iniciar un chat con el asesor:</p>
                    {servicios.map(s => (
                      <div key={s.ID_Servicio}
                        className="border rounded-3 p-2 mb-2 text-start"
                        style={{ backgroundColor: 'var(--color-surfaceAlt)', borderColor: 'var(--color-border)', fontSize: '0.82rem' }}
                      >
                        <div className="fw-bold mb-1">Servicio #{s.ID_Servicio}</div>
                        <div className="text-muted mb-2">{s.Movil_Nombre || 'Sin dispositivo'}</div>
                        <button
                          className="btn btn-sm btn-primary w-100"
                          disabled={iniciandoChat === s.ID_Servicio}
                          onClick={() => iniciarChatDesdeServicio(s.ID_Servicio)}
                        >
                          {iniciandoChat === s.ID_Servicio ? 'Iniciando...' : 'Iniciar Chat'}
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="text-muted small mb-2">No tienes conversaciones activas.</p>
                    {role === 2 && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setVista('miServicio')}
                      >
                        Ver Mis Servicios
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              chatsFiltrados.map(c => {
                const isActive = chatSel?.Codigo_Chat === c.Codigo_Chat;
                return (
                  <div
                    key={c.Codigo_Chat}
                    className="p-3 border-bottom"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'var(--color-primary-lt)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                      transition: 'background-color .15s, color .15s',
                      borderColor: 'var(--color-border)'
                    }}
                    onClick={() => setChatSel(c)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          minWidth: '40px', 
                          backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-dark-soft)', 
                          fontSize: '0.8rem',
                          color: '#fff'
                        }}>
                        {c.ID_Servicio
                          ? String(c.ID_Servicio).substring(0, 2).toUpperCase()
                          : 'CT'
                        }
                      </div>
                      <div>
                        <div className={`fw-bold small ${isActive ? 'text-primary' : ''}`}>Chat #{c.Codigo_Chat}</div>
                        <div className="small text-muted">
                          {c.ID_Servicio ? `Servicio #${c.ID_Servicio}` : 'Consulta de catálogo'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL DERECHO: CONVERSACIÓN */}
        <div className="d-flex flex-column flex-grow-1" style={{ overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
          {!chatSel ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted px-4">
              <div style={{ color: 'var(--color-primary)', opacity: 0.4 }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <polyline points="2,4 12,13 22,4"/>
                </svg>
              </div>
              <h5 className="mt-3 fw-bold text-muted">
                {chats.length === 0 && role === 2 ? 'Inicia una conversación' : 'Selecciona un chat'}
              </h5>
              <p className="small text-center text-muted">
                {chats.length === 0 && role === 2
                  ? 'Elige uno de tus servicios de la lista lateral para chatear con tu asesor técnico.'
                  : role === 2
                    ? 'Elige una de tus conversaciones activas de la lista lateral.'
                    : 'Elige una conversación de la lista lateral para ver los mensajes y responder al cliente.'}
              </p>
            </div>
          ) : (
            <>
              {/* CABECERA DEL CHAT */}
              <div className="p-3 border-bottom d-flex align-items-center gap-3" style={{ backgroundColor: 'var(--color-surfaceAlt)', borderColor: 'var(--color-border)' }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: '44px', height: '44px', backgroundColor: 'var(--color-primary)', fontSize: '0.9rem', color: '#fff' }}>
                  {String(chatSel.ID_Usuario).substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="fw-bold">Chat #{chatSel.Codigo_Chat}</div>
                  <div className="small text-muted">
                    {chatSel.ID_Servicio
                      ? `Servicio #${chatSel.ID_Servicio} · ${chatSel.ID_Usuario}`
                      : `Consulta de catálogo · ${chatSel.ID_Usuario}`
                    }
                  </div>
                </div>
              </div>

              {/* MENSAJES */}
              <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: 'var(--chat-bg)' }}>
                {cargando ? (
                  <div className="text-center py-4 text-muted">Cargando mensajes...</div>
                ) : mensajes.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <p>No hay mensajes en este chat aún.</p>
                    <p className="small">Sé el primero en escribir.</p>
                  </div>
                ) : (
                  mensajes.map(m => {
                    const esMio = String(m.ID_Usuario) === String(usuario);
                    return (
                      <div key={m.Codigo_Mensaje}
                        className={`d-flex mb-3 ${esMio ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div style={{ maxWidth: '70%' }}>
                          <div
                            className="p-3 rounded-3 shadow-sm"
                            style={{
                              backgroundColor: esMio ? 'var(--chat-bubble-me)' : 'var(--chat-bubble-other)',
                              color: esMio ? '#ffffff' : 'var(--chat-text-other)',
                              borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            }}>
                            <div className="small fw-bold opacity-75 mb-1">{m.ID_Usuario}</div>
                            <div>{m.Mensaje}</div>
                          </div>
                          <div className={`d-flex mt-1 gap-2 align-items-center ${esMio ? 'justify-content-end' : ''}`}>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {/* M1 FIX: Formatear DATETIME en lugar de mostrar ISO crudo */}
                              {m.Fecha_Mensaje
                                ? new Date(m.Fecha_Mensaje).toLocaleString('es-CO', {
                                    day: '2-digit', month: 'short',
                                    hour: '2-digit', minute: '2-digit'
                                  })
                                : ''}
                            </small>
                            {esMio && (
                              <button 
                                className="btn btn-link p-0 text-decoration-none text-danger fw-bold" 
                                style={{ fontSize: '0.75rem' }} 
                                onClick={() => eliminarMensaje(m.Codigo_Mensaje)}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={mensajesEndRef} />
              </div>

              {/* INPUT DE MENSAJE */}
              <div className="p-3 border-top" style={{ backgroundColor: 'var(--color-surfaceAlt)', borderColor: 'var(--color-border)' }}>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe un mensaje... (Enter para enviar)"
                    value={nuevoMensaje}
                    onChange={e => setNuevoMensaje(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                  />
                  <button
                    className="btn btn-primary px-4"
                    onClick={enviarMensaje}
                    disabled={!nuevoMensaje.trim()}>
                    Enviar
                  </button>
                </div>
                <small className="text-muted mt-1 d-block">
                  Enviando como: <strong>{usuario}</strong> · Chat #{chatSel.Codigo_Chat}
                </small>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MENÚ LATERAL */}
      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Menú de Navegación</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <Sidebar setVista={setVista} />
      </div>
    </div>
  );
};

export default ChatVista;
