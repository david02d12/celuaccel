import { useState, useEffect, useCallback } from 'react';

export const useCustomRouter = (logueado, setLogueado, cerrarSesionInterno) => {
  const [vista, setVista] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('token')) return 'resetPassword';
    const token = sessionStorage.getItem('token');
    if (token) return sessionStorage.getItem('ultimaVista') || 'home';
    return 'catalogoPublico';
  });

  const [modoRegistro, setModoRegistro] = useState(false);
  const [perfilTarget, setPerfilTarget] = useState(null);

  useEffect(() => {
    const estadoActual = window.history.state;
    if (!estadoActual?.vista) {
      window.history.replaceState({ vista, perfilId: perfilTarget || null }, '', window.location.href);
    }
  }, [vista, perfilTarget]);

  const cambiarVista = useCallback((nuevaVista, extra = null, agregarHistorial = true) => {
    setVista(nuevaVista);
    if (sessionStorage.getItem('token')) {
      sessionStorage.setItem('ultimaVista', nuevaVista);
    }
    if (nuevaVista !== 'registro') setModoRegistro(false);
    
    if (nuevaVista === 'perfil' && extra?.perfilId) {
      setPerfilTarget(extra.perfilId);
    } else if (nuevaVista !== 'perfil') {
      setPerfilTarget(null);
    }

    if (agregarHistorial) {
      window.history.pushState(
        { vista: nuevaVista, perfilId: extra?.perfilId || null },
        '',
        window.location.href
      );
    }
  }, []);

  useEffect(() => {
    const manejarHistorial = (event) => {
      const estado = event.state;
      const token = sessionStorage.getItem('token');
      const role = Number(sessionStorage.getItem('role')) || 2;

      if (!token) {
        setLogueado(false);
        setVista('catalogoPublico');
        window.history.replaceState({ vista: 'catalogoPublico', perfilId: null }, '', window.location.href);
        return;
      }

      if (estado?.vista) {
        const vistaDeseada = estado.vista;
        const vistasAdmin = ['usuarios', 'roles', 'tipo'];
        const vistasTecnicoAdmin = ['servicios', 'historial', 'productos', 'categorias', 'preguntas', 'chats', 'mensajes', 'notificaciones'];

        let vistaPermitida = vistaDeseada;
        if (vistasAdmin.includes(vistaDeseada) && role !== 3) {
          vistaPermitida = 'home';
        } else if (vistasTecnicoAdmin.includes(vistaDeseada) && role !== 1 && role !== 3) {
          vistaPermitida = 'home';
        }

        setVista(vistaPermitida);
        if (vistaPermitida === 'perfil' && estado.perfilId) {
          setPerfilTarget(estado.perfilId);
        } else {
          setPerfilTarget(null);
        }

        sessionStorage.setItem('ultimaVista', vistaPermitida);
        return;
      }

      setLogueado(true);
      const ultimaVista = sessionStorage.getItem('ultimaVista') || 'home';
      setVista(ultimaVista);
      window.history.replaceState({ vista: ultimaVista, perfilId: null }, '', window.location.href);
    };

    window.addEventListener('popstate', manejarHistorial);
    return () => window.removeEventListener('popstate', manejarHistorial);
  }, [setLogueado]);

  useEffect(() => {
    const irAlInicio = () => cambiarVista('home');
    window.addEventListener('navigateHome', irAlInicio);
    return () => window.removeEventListener('navigateHome', irAlInicio);
  }, [cambiarVista]);

  useEffect(() => {
    const forzarLogin = () => {
      setVista('login');
      setModoRegistro(false);
      setPerfilTarget(null);
    };
    window.addEventListener('forzarLogin', forzarLogin);
    return () => window.removeEventListener('forzarLogin', forzarLogin);
  }, []);

  const cerrarSesion = useCallback(() => {
    cerrarSesionInterno();
    setModoRegistro(false);
    setPerfilTarget(null);
    setVista('catalogoPublico');
  }, [cerrarSesionInterno]);

  return { vista, modoRegistro, setModoRegistro, perfilTarget, cambiarVista, cerrarSesion };
};
