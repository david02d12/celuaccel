/**
 * Paginacion.jsx — Componente de controles de paginación reutilizable.
 * Uso: <Paginacion pagina={pagina} totalPaginas={totalPaginas} setPagina={setPagina} />
 */
import React from 'react';

const Paginacion = ({ pagina, totalPaginas, setPagina }) => {
  if (totalPaginas <= 1) return null;
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">
      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={pagina === 1}
        onClick={() => setPagina(1)}
      >«</button>
      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={pagina === 1}
        onClick={() => setPagina(p => p - 1)}
      >‹</button>

      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          className={`btn btn-sm ${n === pagina ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setPagina(n)}
        >{n}</button>
      ))}

      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={pagina === totalPaginas}
        onClick={() => setPagina(p => p + 1)}
      >›</button>
      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={pagina === totalPaginas}
        onClick={() => setPagina(totalPaginas)}
      >»</button>
    </div>
  );
};

export default Paginacion;
