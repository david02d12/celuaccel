import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useCatalogoPublico = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get(`${BASE_URL}/productos/publico`),
          axios.get(`${BASE_URL}/categorias/publico`),
        ]);
        const activos = (pRes.data || []).filter(
          p => Number(p.Activo_Catalogo) === 1 && Number(p.Cantidad) > 0
        );
        setProductos(activos);
        setCategorias(cRes.data || []);
        setError(null);
      } catch (err) {
        console.warn('Catálogo público: backend no disponible', err.message);
        setError('No se pudo conectar al servidor. Intenta más tarde.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    return productos.filter(p => {
      const ok = p.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                 p.Descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      const cat = !categoriaFiltro || String(p.ID_Categoria) === categoriaFiltro;
      return ok && cat;
    });
  }, [productos, busqueda, categoriaFiltro]);

  const nombreCat = id => {
    const c = categorias.find(c => String(c.ID_Categoria) === String(id));
    return c?.Nombre_Categoria ?? 'General';
  };

  return {
    productos,
    categorias,
    busqueda, setBusqueda,
    categoriaFiltro, setCategoriaFiltro,
    cargando, error,
    filtrados, nombreCat
  };
};
