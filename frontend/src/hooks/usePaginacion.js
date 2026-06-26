/**
 * usePaginacion.js
 * Hook reutilizable de paginación.
 * Uso: const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(datos, 7);
 */
import { useState, useMemo } from 'react';

export function usePaginacion(datos = [], porPagina = 7) {
    const [pagina, setPagina] = useState(1);

    const totalPaginas = Math.max(1, Math.ceil(datos.length / porPagina));

    // Si el filtro reduce los resultados y la página actual ya no existe, volver a la 1
    const paginaReal = Math.min(pagina, totalPaginas);

    const datosPagina = useMemo(() => {
        const inicio = (paginaReal - 1) * porPagina;
        return datos.slice(inicio, inicio + porPagina);
    }, [datos, paginaReal, porPagina]);

    return { pagina: paginaReal, setPagina, totalPaginas, datosPagina };
}
