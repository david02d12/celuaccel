import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login';
import Registro from './components/Registro';
import Home from './components/Home';
import Servicios from './components/tecnico/Servicios';
import Roles from './components/admin/Roles';
import Historial from './components/tecnico/Historial';
import Tipo from './components/admin/Tipo';
import Productos from './components/tecnico/Productos';
import Categorias from './components/tecnico/Categorias';
import Preguntas from './components/tecnico/Preguntas';
import Chats from './components/tecnico/Chats';
import Comentarios from './components/usuario/Comentarios';
import Mensajes from './components/tecnico/Mensajes';
import Notificaciones from './components/tecnico/Notificaciones';
import Usuarios from './components/admin/Usuarios';
import Catalogo from './components/usuario/Catalogo';
import ChatVista from './components/usuario/ChatVista';
import MiServicio from './components/usuario/MiServicio';
import Perfil from './components/usuario/Perfil';
import MisNotificaciones from './components/usuario/MisNotificaciones';

// RNF007 — Tiempo de inactividad antes del cierre automático de sesión (15 min)
const INACTIVIDAD_MS = 15 * 60 * 1000;

function App() {
  const [logueado, setLogueado] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [vista, setVista] = useState(localStorage.getItem('ultimaVista') || 'home');
  const [perfilTarget, setPerfilTarget] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setLogueado(true);
  }, []);

  // RNF007 — Cierre automático por inactividad de 15 minutos
  const cerrarSesion = useCallback(() => {
    localStorage.clear();
    setLogueado(false);
    setVista('home');
  }, []);

  useEffect(() => {
    if (!logueado) return;

    let timer = setTimeout(() => {
      alert('Tu sesión ha expirado por inactividad (15 minutos). Por favor inicia sesión nuevamente.');
      cerrarSesion();
    }, INACTIVIDAD_MS);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        alert('Tu sesión ha expirado por inactividad (15 minutos). Por favor inicia sesión nuevamente.');
        cerrarSesion();
      }, INACTIVIDAD_MS);
    };

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    eventos.forEach(e => window.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timer);
      eventos.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [logueado, cerrarSesion]);

  const cambiarVista = (nuevaVista, extra) => {
    setVista(nuevaVista);
    localStorage.setItem('ultimaVista', nuevaVista);
    // Si se navega a 'perfil' con un ID específico, guardarlo
    if (nuevaVista === 'perfil' && extra?.perfilId) {
      setPerfilTarget(extra.perfilId);
    } else if (nuevaVista !== 'perfil') {
      setPerfilTarget(null);
    }
  };

  // Antena Receptora global para atajo del Logotipo
  useEffect(() => {
    const irAlInicio = () => cambiarVista('home');
    window.addEventListener('navigateHome', irAlInicio);
    return () => window.removeEventListener('navigateHome', irAlInicio);
  }, []);

  if (!logueado) {
    return modoRegistro
      ? <Registro setModoRegistro={setModoRegistro} />
      : <Login setLogueado={setLogueado} setModoRegistro={setModoRegistro} />;
  }

  // SWITCH PARA LAS VISTAS
  const role = Number(localStorage.getItem('role')) || 2;

  switch (vista) {
    case 'home':
      return <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
      
    // CLIENTE / USUARIO PUBLICO (Cualquier rol accede)
    case 'miServicio':
      return <MiServicio cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'catalogo':
      return <Catalogo cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'chatVista':
      return <ChatVista cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'comentarios':
      return <Comentarios cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'perfil':
      return <Perfil cerrarSesion={cerrarSesion} setVista={cambiarVista} perfilObjetivoId={perfilTarget} />;
    case 'misNotificaciones':
      return <MisNotificaciones cerrarSesion={cerrarSesion} setVista={cambiarVista} />;

    // TECNICO Y ADMINISTRADOR (Roles 1 y 3)
    case 'servicios':
      return (role === 1 || role === 3) ? <Servicios cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'historial':
      return (role === 1 || role === 3) ? <Historial cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'productos':
      return (role === 1 || role === 3) ? <Productos cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'categorias':
      return (role === 1 || role === 3) ? <Categorias cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'preguntas':
      return (role === 1 || role === 3) ? <Preguntas cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'chats':
      return (role === 1 || role === 3) ? <Chats cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'mensajes':
      return (role === 1 || role === 3) ? <Mensajes cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'notificaciones':
      return (role === 1 || role === 3) ? <Notificaciones cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;

    // EXCLUSIVO ADMINISTRADOR (Rol 3)
    case 'usuarios':
      return (role === 3) ? <Usuarios cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'roles':
      return (role === 3) ? <Roles cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'tipo':
      return (role === 3) ? <Tipo cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;

    default:
      return <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
  }
}

export default App;