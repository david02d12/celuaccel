/* eslint-disable react-refresh/only-export-components */
/**
 * AuthContext.jsx
 * Contexto global de autenticación.
 *
 * Proporciona:
 *   - usuario: objeto con datos del usuario actual (o null si no hay sesión)
 *   - token: string JWT (o null)
 *   - iniciarSesion(token, usuario): guarda sesión en estado y localStorage
 *   - cerrarSesion(): borra sesión y redirige al login
 *
 * Uso en cualquier componente:
 *   import { useAuth } from '../hooks/useAuth';
 *   const { usuario, cerrarSesion } = useAuth();
 */
import { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        try {
            const stored = localStorage.getItem('usuario');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    const iniciarSesion = useCallback((nuevoToken, nuevoUsuario) => {
        localStorage.setItem('token', nuevoToken);
        localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
        setToken(nuevoToken);
        setUsuario(nuevoUsuario);
    }, []);

    const cerrarSesion = useCallback(() => {
        localStorage.clear();
        setToken(null);
        setUsuario(null);
    }, []);

    return (
        <AuthContext.Provider value={{ usuario, token, iniciarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
}
