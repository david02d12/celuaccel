import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useSessionGuard } from './hooks/useSessionGuard';
import { useCustomRouter } from './hooks/useCustomRouter';

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
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import CatalogoPublico from './components/publico/CatalogoPublico';
import MisPreguntas from './components/usuario/MisPreguntas';

function App() {
  const { logueado, setLogueado, cerrarSesionInterno } = useSessionGuard();
  const { vista, modoRegistro, setModoRegistro, perfilTarget, cambiarVista, cerrarSesion } = useCustomRouter(logueado, setLogueado, cerrarSesionInterno);

  if (!logueado) {
    if (vista === 'catalogoPublico') return <CatalogoPublico setVista={cambiarVista} />;
    if (vista === 'registro' || modoRegistro) return <Registro setModoRegistro={setModoRegistro} setVista={cambiarVista} />;
    if (vista === 'forgotPassword') return <ForgotPassword setVista={cambiarVista} />;
    if (vista === 'resetPassword') return <ResetPassword setVista={cambiarVista} />;
    return <Login setLogueado={setLogueado} setModoRegistro={setModoRegistro} setVista={cambiarVista} />;
  }

  const role = Number(sessionStorage.getItem('role')) || 2;

  switch (vista) {
    case 'catalogoPublico':
    case 'login':
    case 'registro':
    case 'home':
      return <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;

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
    case 'misPreguntas':
      return <MisPreguntas cerrarSesion={cerrarSesion} setVista={cambiarVista} />;

    case 'servicios':
      return role === 1 || role === 3 ? <Servicios cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'historial':
      return role === 1 || role === 3 ? <Historial cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'productos':
      return role === 1 || role === 3 ? <Productos cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'categorias':
      return role === 1 || role === 3 ? <Categorias cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'preguntas':
      return role === 1 || role === 3 ? <Preguntas cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'chats':
      return role === 1 || role === 3 ? <Chats cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'mensajes':
      return role === 1 || role === 3 ? <Mensajes cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'notificaciones':
      return role === 1 || role === 3 ? <Notificaciones cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;

    case 'usuarios':
      return role === 3 ? <Usuarios cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'roles':
      return role === 3 ? <Roles cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
    case 'tipo':
      return role === 3 ? <Tipo cerrarSesion={cerrarSesion} setVista={cambiarVista} /> : <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;

    default:
      return <Home cerrarSesion={cerrarSesion} setVista={cambiarVista} />;
  }
}

export default App;
