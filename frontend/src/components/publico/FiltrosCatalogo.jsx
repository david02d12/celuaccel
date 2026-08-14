import React from 'react';

export const FiltrosCatalogo = ({ busqueda, setBusqueda, categoriaFiltro, setCategoriaFiltro, categorias }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '620px' }}>
      <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
        <svg
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            width: '100%', padding: '13px 14px 13px 42px',
            borderRadius: '10px', border: 'none', outline: 'none',
            fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <select
        value={categoriaFiltro}
        onChange={e => setCategoriaFiltro(e.target.value)}
        style={{
          padding: '13px 16px', borderRadius: '10px', border: 'none', outline: 'none',
          fontSize: '0.88rem', fontFamily: 'inherit', minWidth: '180px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)', cursor: 'pointer',
        }}
      >
        <option value="">Todas las categorias</option>
        {categorias.map(c => (
          <option key={c.ID_Categoria} value={String(c.ID_Categoria)}>
            {c.Nombre_Categoria}
          </option>
        ))}
      </select>
    </div>
  );
};
