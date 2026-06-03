/**
 * useInactividad.js
 * Hook para cerrar sesión automáticamente tras N minutos de inactividad.
 *
 * Uso:
 *   useInactividad(30); // cierra sesión tras 30 min sin actividad
 *
 * Detecta: mousemove, keydown, click, scroll, touchstart
 */
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export function useInactividad(minutos = 30) {
    const { cerrarSesion } = useAuth();
    const timerRef = useRef(null);

    useEffect(() => {
        const ms = minutos * 60 * 1000;

        const resetTimer = () => {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                cerrarSesion();
            }, ms);
        };

        const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        eventos.forEach((ev) => window.addEventListener(ev, resetTimer));
        resetTimer(); // arrancar el timer desde el primer render

        return () => {
            clearTimeout(timerRef.current);
            eventos.forEach((ev) => window.removeEventListener(ev, resetTimer));
        };
    }, [minutos, cerrarSesion]);
}
