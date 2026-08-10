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
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import CatalogoPublico from './components/publico/CatalogoPublico';
import MisPreguntas from './components/usuario/MisPreguntas';

// Tiempo de inactividad antes del cierre automático de sesión (15 min)
const INACTIVIDAD_MS = 15 * 60 * 1000;

function App() {
  /*
   * ============================================================
   * VISTA INICIAL
   * ============================================================
   */

  const [vista, setVista] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    // Si viene un token en la URL, mostrar recuperación de contraseña
    if (params.has('token')) {
      return 'resetPassword';
    }

    const token = sessionStorage.getItem('token');

    // Si existe sesión, recuperar última vista
    if (token) {
      return sessionStorage.getItem('ultimaVista') || 'home';
    }

    // Si no existe sesión, mandar a loguearse
    return 'login';
  });

  const [logueado, setLogueado] = useState(() => {
    return !!sessionStorage.getItem('token');
  });

  const [modoRegistro, setModoRegistro] = useState(false);

  const [perfilTarget, setPerfilTarget] = useState(null);

  /*
   * ============================================================
   * SINCRONIZAR ESTADO DE SESIÓN
   * ============================================================
   */

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (token) {
      setLogueado(true);
    } else {
      setLogueado(false);
    }
  }, []);

  /*
   * ============================================================
   * DESTRUIR SESIÓN AL RECARGAR O SALIR
   * ============================================================
   */
  useEffect(() => {
    const destruirSesionAlSalir = () => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('ultimaVista');
    };

    window.addEventListener('beforeunload', destruirSesionAlSalir);
    
    return () => {
      window.removeEventListener('beforeunload', destruirSesionAlSalir);
    };
  }, []);

  /*
   * ============================================================
   * INICIALIZAR HISTORIAL DEL NAVEGADOR
   *
   * Esto permite que el botón Atrás del navegador conozca
   * qué vista está mostrando React.
   * ============================================================
   */

  useEffect(() => {
    const estadoActual = window.history.state;

    if (!estadoActual?.vista) {
      window.history.replaceState(
        {
          vista,
          perfilId: perfilTarget || null
        },
        '',
        window.location.href
      );
    }
  }, []);

  /*
   * ============================================================
   * CAMBIAR VISTA
   *
   * agregarHistorial = true:
   *   crea una nueva entrada en el navegador.
   *
   * agregarHistorial = false:
   *   solamente cambia React cuando el usuario pulsa Atrás/Adelante.
   * ============================================================
   */

  const cambiarVista = useCallback(
    (nuevaVista, extra = null, agregarHistorial = true) => {
      setVista(nuevaVista);

      // Guardamos la última vista solamente si hay sesión
      if (sessionStorage.getItem('token')) {
        sessionStorage.setItem('ultimaVista', nuevaVista);
      }

      if (nuevaVista !== 'registro') {
        setModoRegistro(false);
      }

      // Guardar ID del perfil si corresponde
      if (nuevaVista === 'perfil' && extra?.perfilId) {
        setPerfilTarget(extra.perfilId);
      } else if (nuevaVista !== 'perfil') {
        setPerfilTarget(null);
      }

      /*
       * Crear entrada en el historial del navegador.
       */
      if (agregarHistorial) {
        window.history.pushState(
          {
            vista: nuevaVista,
            perfilId: extra?.perfilId || null
          },
          '',
          window.location.href
        );
      }
    },
    []
  );

  /*
   * ============================================================
   * BOTÓN ATRÁS / ADELANTE DEL NAVEGADOR
   * ============================================================
   */

  useEffect(() => {
    const manejarHistorial = (event) => {
      const estado = event.state;
      const token = sessionStorage.getItem('token');
      const role = Number(sessionStorage.getItem('role')) || 2;

      /*
       * SEGURIDAD 1: Si no hay token (cerró sesión), 
       * pero intenta retroceder a una vista privada del historial.
       */
      if (!token) {
        setLogueado(false);
        setVista('login');
        
        // Bloqueamos que sigan retrocediendo limpiando el estado actual
        window.history.replaceState({ vista: 'login', perfilId: null }, '', window.location.href);
        return;
      }

      /*
       * SEGURIDAD 2: El usuario sí tiene sesión, validamos 
       * hacia dónde intenta retroceder.
       */
      if (estado?.vista) {
        const vistaDeseada = estado.vista;

        // Validar permisos según rol antes de asignar la vista
        const vistasAdmin = ['usuarios', 'roles', 'tipo'];
        const vistasTecnicoAdmin = ['servicios', 'historial', 'productos', 'categorias', 'preguntas', 'chats', 'mensajes', 'notificaciones'];

        let vistaPermitida = vistaDeseada;

        if (vistasAdmin.includes(vistaDeseada) && role !== 3) {
          vistaPermitida = 'home'; // Intenta ir a vista de admin siendo cliente/técnico
        } else if (vistasTecnicoAdmin.includes(vistaDeseada) && role !== 1 && role !== 3) {
          vistaPermitida = 'home'; // Intenta ir a vista de técnico siendo cliente
        }

        // Aplicamos la vista validada
        setVista(vistaPermitida);

        if (vistaPermitida === 'perfil' && estado.perfilId) {
          setPerfilTarget(estado.perfilId);
        } else {
          setPerfilTarget(null);
        }

        sessionStorage.setItem('ultimaVista', vistaPermitida);
        return;
      }

      // Si por alguna razón vuelve a un historial sin estado pero hay sesión activa
      setLogueado(true);
      const ultimaVista = sessionStorage.getItem('ultimaVista') || 'home';
      setVista(ultimaVista);
      
      window.history.replaceState({ vista: ultimaVista, perfilId: null }, '', window.location.href);
    };

    window.addEventListener('popstate', manejarHistorial);

    return () => {
      window.removeEventListener('popstate', manejarHistorial);
    };
  }, []);

  /*
   * ============================================================
   * CERRAR SESIÓN POR INACTIVIDAD
   * ============================================================
   */

  const cerrarSesion = useCallback(() => {
    /*
     * NO usamos sessionStorage.clear()
     * porque podría borrar otros datos de la aplicación.
     */
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('ultimaVista');

    setLogueado(false);
    setModoRegistro(false);
    setPerfilTarget(null);
    setVista('login');

    /*
     * Reemplazamos la entrada actual para evitar que al pulsar
     * Atrás se vuelva inmediatamente a una pantalla autenticada.
     */
    window.history.replaceState(
      {
        vista: 'login',
        perfilId: null
      },
      '',
      window.location.href
    );
  }, []);

  /*
   * ============================================================
   * CIERRE AUTOMÁTICO POR INACTIVIDAD
   * ============================================================
   */

  useEffect(() => {
    if (!logueado) return;

    let timer;

    const ejecutarCierre = () => {
      alert(
        'Tu sesión ha expirado por inactividad (15 minutos). Por favor inicia sesión nuevamente.'
      );

      cerrarSesion();
    };

    const resetTimer = () => {
      clearTimeout(timer);

      timer = setTimeout(
        ejecutarCierre,
        INACTIVIDAD_MS
      );
    };

    const eventos = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart'
    ];

    eventos.forEach((evento) => {
      window.addEventListener(evento, resetTimer);
    });

    // Iniciar contador
    resetTimer();

    return () => {
      clearTimeout(timer);

      eventos.forEach((evento) => {
        window.removeEventListener(evento, resetTimer);
      });
    };
  }, [logueado, cerrarSesion]);

  /*
   * ============================================================
   * ANTENA RECEPTORA GLOBAL PARA EL LOGOTIPO
   * ============================================================
   */

  useEffect(() => {
    const irAlInicio = () => {
      cambiarVista('home');
    };

    window.addEventListener(
      'navigateHome',
      irAlInicio
    );

    return () => {
      window.removeEventListener(
        'navigateHome',
        irAlInicio
      );
    };
  }, [cambiarVista]);

  /*
   * ============================================================
   * SESIÓN EXPIRADA DESDE api.js
   * ============================================================
   */

  useEffect(() => {
    const manejarSesionExpirada = () => {
      /*
       * Eliminamos únicamente los datos relacionados
       * con la autenticación.
       */
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('ultimaVista');

      setLogueado(false);
      setModoRegistro(false);
      setPerfilTarget(null);
      setVista('login');

      window.history.replaceState(
        {
          vista: 'login',
          perfilId: null
        },
        '',
        window.location.href
      );
    };

    window.addEventListener(
      'sessionExpired',
      manejarSesionExpirada
    );

    return () => {
      window.removeEventListener(
        'sessionExpired',
        manejarSesionExpirada
      );
    };
  }, []);

  /*
   * ============================================================
   * USUARIO NO AUTENTICADO
   * ============================================================
   */

  if (!logueado) {
    if (vista === 'catalogoPublico') {
      return (
        <CatalogoPublico
          setVista={cambiarVista}
        />
      );
    }

    if (
      vista === 'registro' ||
      modoRegistro
    ) {
      return (
        <Registro
          setModoRegistro={setModoRegistro}
          setVista={cambiarVista}
        />
      );
    }

    if (vista === 'forgotPassword') {
      return (
        <ForgotPassword
          setVista={cambiarVista}
        />
      );
    }

    if (vista === 'resetPassword') {
      return (
        <ResetPassword
          setVista={cambiarVista}
        />
      );
    }

    // Login por defecto
    return (
      <Login
        setLogueado={setLogueado}
        setModoRegistro={setModoRegistro}
        setVista={cambiarVista}
      />
    );
  }

  /*
   * ============================================================
   * USUARIO AUTENTICADO
   * ============================================================
   */

  const role =
    Number(sessionStorage.getItem('role')) || 2;

  /*
   * ============================================================
   * SWITCH DE VISTAS
   * ============================================================
   */

  switch (vista) {
    /*
     * ----------------------------------------------------------
     * VISTAS GENERALES
     * ----------------------------------------------------------
     */

    case 'catalogoPublico':
    case 'login':
    case 'registro':
    case 'home':
      return (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    /*
     * ----------------------------------------------------------
     * CLIENTE / USUARIO
     * ----------------------------------------------------------
     */

    case 'miServicio':
      return (
        <MiServicio
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'catalogo':
      return (
        <Catalogo
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'chatVista':
      return (
        <ChatVista
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'comentarios':
      return (
        <Comentarios
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'perfil':
      return (
        <Perfil
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
          perfilObjetivoId={perfilTarget}
        />
      );

    case 'misNotificaciones':
      return (
        <MisNotificaciones
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'misPreguntas':
      return (
        <MisPreguntas
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    /*
     * ----------------------------------------------------------
     * TÉCNICO Y ADMINISTRADOR
     * ROLES 1 Y 3
     * ----------------------------------------------------------
     */

    case 'servicios':
      return role === 1 || role === 3 ? (
        <Servicios
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'historial':
      return role === 1 || role === 3 ? (
        <Historial
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'productos':
      return role === 1 || role === 3 ? (
        <Productos
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'categorias':
      return role === 1 || role === 3 ? (
        <Categorias
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'preguntas':
      return role === 1 || role === 3 ? (
        <Preguntas
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'chats':
      return role === 1 || role === 3 ? (
        <Chats
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'mensajes':
      return role === 1 || role === 3 ? (
        <Mensajes
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'notificaciones':
      return role === 1 || role === 3 ? (
        <Notificaciones
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    /*
     * ----------------------------------------------------------
     * ADMINISTRADOR
     * ROL 3
     * ----------------------------------------------------------
     */

    case 'usuarios':
      return role === 3 ? (
        <Usuarios
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'roles':
      return role === 3 ? (
        <Roles
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    case 'tipo':
      return role === 3 ? (
        <Tipo
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      ) : (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );

    /*
     * ----------------------------------------------------------
     * VISTA POR DEFECTO
     * ----------------------------------------------------------
     */

    default:
      return (
        <Home
          cerrarSesion={cerrarSesion}
          setVista={cambiarVista}
        />
      );
  }
}

export default App;
