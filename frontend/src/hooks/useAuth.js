/**
 * useAuth.js
 * Hook para acceder al contexto de autenticación.
 *
 * Uso:
 *   const { usuario, token, iniciarSesion, cerrarSesion } = useAuth();
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    }
    return ctx;
}
