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

      // Enlace Automático desde Servicios o MiServicio
      const chatInfoRaw = localStorage.getItem('chatInfo');
      if (chatInfoRaw) {
        const info = JSON.parse(chatInfoRaw);
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

  // Inicia un chat asociado a un servicio específico
  const iniciarChatDesdeServicio = async (idServicio) => {
    setIniciandoChat(idServicio);
    try {
      // Verificar si ya existe un chat para ese servicio
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
      {/* NAVBAR */}
      <Navbar titulo="CELUACCEL — Soporte en Línea" cerrarSesion={cerrarSesion} />

      {/* Boton para abrir panel en movil */}
      <div className="d-md-none px-3 pt-2 pb-1 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
        <button
          className="btn btn-sm fw-bold text-white w-100"
          style={{ backgroundColor: '#121212' }}
          onClick={() => setPanelAbierto(v => !v)}
        >
          {panelAbierto ? '✕ Cerrar conversaciones' : '☰ Ver conversaciones'}
        </button>
      </div>

      {/* CUERPO DEL CHAT */}
      <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>

        {/* PANEL IZQUIERDO */}
        <div
          className={`d-flex flex-column border-end ${panelAbierto ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ width: '300px', minWidth: '260px', backgroundColor: '#f8f9fa', flexShrink: 0 }}
        >
          <div className="p-3 border-bottom" style={{ backgroundColor: '#121212' }}>
            <p className="text-white fw-bold mb-2 small">
              {role === 2 ? 'Mis Conversaciones' : 'Conversaciones Abiertas'}
            </p>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder=" Buscar chat (ID o Servicio)..."
              value={busquedaChat}
              onChange={e => setBusquedaChat(e.target.value)}
            />
          </div>
          <div style={{ overflowY: 'auto', flexGrow: 1 }}>
            {cargandoChats ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm" style={{ color: '#DB0000' }} />
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
                        style={{ backgroundColor: '#fff', fontSize: '0.82rem' }}
                      >
                        <div className="fw-bold mb-1">Servicio #{s.ID_Servicio}</div>
                        <div className="text-muted mb-2">{s.Movil_Nombre || 'Sin dispositivo'}</div>
                        <button
                          className="btn btn-sm text-white fw-bold w-100"
                          style={{ backgroundColor: iniciandoChat === s.ID_Servicio ? '#8B0000' : '#DB0000' }}
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
                        className="btn btn-sm text-white fw-bold"
                        style={{ backgroundColor: '#DB0000' }}
                        onClick={() => setVista('miServicio')}
                      >
                        Ver Mis Servicios
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              chatsFiltrados.map(c => (
                <div
                  key={c.Codigo_Chat}
                  className="p-3 border-bottom"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: chatSel?.Codigo_Chat === c.Codigo_Chat ? '#DB0000' : 'transparent',
                    color: chatSel?.Codigo_Chat === c.Codigo_Chat ? 'white' : 'inherit',
                    transition: 'background-color .15s'
                  }}
                  onClick={() => setChatSel(c)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ width: '40px', height: '40px', minWidth: '40px', backgroundColor: '#121212', fontSize: '0.8rem' }}>
                      {String(c.ID_Servicio).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold small">Chat #{c.Codigo_Chat}</div>
                      <div className="small opacity-75">Servicio #{c.ID_Servicio}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL DERECHO — MENSAJES */}
        <div className="d-flex flex-column flex-grow-1" style={{ overflow: 'hidden', backgroundColor: '#fff' }}>
          {!chatSel ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted px-4">
              <div style={{ fontSize: '3rem', color: '#DB0000', opacity: 0.4 }}>&#9993;</div>
              <h5 className="mt-3 fw-bold" style={{ color: '#121212' }}>
                {chats.length === 0 && role === 2 ? 'Inicia una conversación' : 'Selecciona un chat'}
              </h5>
              <p className="small text-center">
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
              <div className="p-3 border-bottom d-flex align-items-center gap-3" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: '44px', height: '44px', backgroundColor: '#DB0000', fontSize: '0.9rem' }}>
                  {String(chatSel.ID_Usuario).substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="fw-bold">Chat #{chatSel.Codigo_Chat}</div>
                  <div className="small text-muted">Servicio #{chatSel.ID_Servicio} · {chatSel.ID_Usuario}</div>
                </div>
              </div>

              {/* MENSAJES */}
              <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: '#fafafa' }}>
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
                              backgroundColor: esMio ? '#DB0000' : '#121212',
                              color: 'white',
                              borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            }}>
                            <div className="small fw-bold opacity-75 mb-1">{m.ID_Usuario}</div>
                            <div>{m.Mensaje}</div>
                          </div>
                          <div className={`d-flex mt-1 gap-2 ${esMio ? 'justify-content-end' : ''}`}>
                            <small className="text-muted">{m.Fecha_Mensaje}</small>
                            {esMio && (
                              <button className="btn btn-sm text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={() => eliminarMensaje(m.Codigo_Mensaje)}>
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
              <div className="p-3 border-top" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe un mensaje... (Enter para enviar)"
                    value={nuevoMensaje}
                    onChange={e => setNuevoMensaje(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className="btn text-white fw-bold px-4"
                    style={{ backgroundColor: '#DB0000', minWidth: '80px' }}
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
      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal" style={{ backgroundColor: '#121212' }}>
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
