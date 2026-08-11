import { useState, useEffect, useCallback } from 'react';
import { mostrarAlerta } from '../utils/alerts';

const INACTIVIDAD_MS = 15 * 60 * 1000;

export const useSessionGuard = () => {
  const [logueado, setLogueado] = useState(() => {
    return !!sessionStorage.getItem('token');
  });

  const cerrarSesionInterno = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('ultimaVista');
    setLogueado(false);

    window.history.replaceState(
      { vista: 'login', perfilId: null },
      '',
      window.location.href
    );
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) setLogueado(true);
    else setLogueado(false);
  }, []);

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

  useEffect(() => {
    if (!logueado) return;
    let timer;

    const ejecutarCierre = async () => {
      await mostrarAlerta(
        'Tu sesión ha expirado por inactividad (15 minutos). Por favor inicia sesión nuevamente.',
        'warning',
        'Sesión expirada'
      );
      cerrarSesionInterno();
      // Dispatch un evento personalizado para que el enrutador sepa que cerró sesión
      window.dispatchEvent(new Event('forzarLogin'));
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(ejecutarCierre, INACTIVIDAD_MS);
    };

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    eventos.forEach((evento) => window.addEventListener(evento, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      eventos.forEach((evento) => window.removeEventListener(evento, resetTimer));
    };
  }, [logueado, cerrarSesionInterno]);

  useEffect(() => {
    const manejarSesionExpirada = () => {
      cerrarSesionInterno();
      window.dispatchEvent(new Event('forzarLogin'));
    };
    window.addEventListener('sessionExpired', manejarSesionExpirada);
    return () => window.removeEventListener('sessionExpired', manejarSesionExpirada);
  }, [cerrarSesionInterno]);

  return { logueado, setLogueado, cerrarSesionInterno };
};
