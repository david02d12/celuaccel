import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { mostrarAlerta, confirmar } from '../../utils/alerts';

export const useChatView = (role, usuario) => {
  const [chats, setChats] = useState([]);
  const [chatSel, setChatSel] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [busquedaChat, setBusquedaChat] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoChats, setCargandoChats] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [iniciandoChat, setIniciandoChat] = useState(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    cargarChats();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (chatSel) cargarMensajes(chatSel.Codigo_Chat);
  }, [chatSel]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const procesarEnlaceAutomatico = async (info, chatsCargados, url) => {
    if (info.Codigo_Chat) {
      const chatExistente = chatsCargados.find(c => String(c.Codigo_Chat) === String(info.Codigo_Chat));
      if (chatExistente) setChatSel(chatExistente);
    } else if (info.ID_Servicio) {
      let chatExistente = chatsCargados.find(c => String(c.ID_Servicio) === String(info.ID_Servicio));
      if (chatExistente) {
        setChatSel(chatExistente);
      } else if (role === 2) {
        await api.post('/chats/agregar', { ID_Usuario: usuario, ID_Servicio: info.ID_Servicio });
        const resUpdated = await api.get(url);
        chatsCargados = resUpdated.data;
        chatExistente = chatsCargados.find(c => String(c.ID_Servicio) === String(info.ID_Servicio));
        if (chatExistente) setChatSel(chatExistente);
      }
    }
    sessionStorage.removeItem('chatInfo');
    return chatsCargados;
  };

  const cargarChats = async () => {
    setCargandoChats(true);
    try {
      const url = role === 2 ? '/chats/listar-mios' : '/chats/listar';
      const res = await api.get(url);
      let chatsCargados = res.data;

      const chatInfoRaw = sessionStorage.getItem('chatInfo');
      if (chatInfoRaw) {
        chatsCargados = await procesarEnlaceAutomatico(JSON.parse(chatInfoRaw), chatsCargados, url);
      }

      setChats(chatsCargados);
      if (chatsCargados.length === 0 && role === 2) {
        const resSvc = await api.get(`/servicios/mis-servicios/${usuario}`);
        setServicios(resSvc.data.filter(s => Number(s.Etapa) !== -1));
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
      await mostrarAlerta('Error al iniciar el chat. Intenta de nuevo.', 'error');
    } finally {
      setIniciandoChat(null);
    }
  };

  const cargarMensajes = async (codigoChat) => {
    try {
      setCargando(true);
      const res = await api.get(`/mensajes/por-chat/${codigoChat}`);
      setMensajes(res.data);
      // Marcar los mensajes entrantes como leídos
      api.put(`/mensajes/leidos/${codigoChat}`).catch(err => console.error('Error al marcar leídos:', err));
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
      await mostrarAlerta('Error al enviar el mensaje. Verifica que los campos sean correctos.', 'error');
    }
  };

  const eliminarMensaje = async (id) => {
    if (!await confirmar('¿Eliminar este mensaje?')) return;
    try {
      await api.delete(`/mensajes/eliminar/${id}`);
      cargarMensajes(chatSel.Codigo_Chat);
    } catch (err) {
      await mostrarAlerta('Error al eliminar el mensaje.', 'error');
    }
  };

  const eliminarChat = async (id) => {
    if (!await confirmar('¿Estás seguro de ocultar este chat? Desaparecerá de tu lista.')) return;
    try {
      await api.delete(`/chats/eliminar/${id}`);
      await mostrarAlerta('Chat ocultado correctamente', 'success');
      setChatSel(null);
      cargarChats();
    } catch (err) {
      await mostrarAlerta('Error al ocultar el chat.', 'error');
    }
  };

  const restaurarChat = async (id) => {
    if (!await confirmar('¿Estás seguro de restaurar este chat y hacerlo visible de nuevo?')) return;
    try {
      await api.put(`/chats/restaurar/${id}`);
      await mostrarAlerta('Chat restaurado correctamente', 'success');
      cargarChats();
      // Update local chatSel state if it's the currently selected chat
      setChatSel(prev => prev && prev.Codigo_Chat === id ? { ...prev, Estado_Chat: 'Activo' } : prev);
    } catch (err) {
      await mostrarAlerta('Error al restaurar el chat.', 'error');
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

  return {
    chats, setChats,
    chatSel, setChatSel,
    mensajes, setMensajes,
    nuevoMensaje, setNuevoMensaje,
    busquedaChat, setBusquedaChat,
    cargando, setCargando,
    cargandoChats, setCargandoChats,
    servicios, setServicios,
    iniciandoChat, setIniciandoChat,
    panelAbierto, setPanelAbierto,
    mensajesEndRef,
    iniciarChatDesdeServicio,
    enviarMensaje,
    eliminarMensaje,
    eliminarChat,
    restaurarChat,
    chatsFiltrados,
    handleKeyDown
  };
};
