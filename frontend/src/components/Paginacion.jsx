/**
 * Paginacion.jsx — Componente de controles de paginación reutilizable.
 * Uso: <Paginacion pagina={pagina} totalPaginas={totalPaginas} setPagina={setPagina} />
 */
import React from 'react';

<<<<<<< HEAD
const Paginacion = ({ pagina, totalPaginas, setPagina }) => {
=======
const Paginacion = ({ pagina, totalPaginas, setPagina, idBase = 'paginacion' }) => {
>>>>>>> 809efa1 (Commit de inicio)
  if (totalPaginas <= 1) return null;
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">
      <button
<<<<<<< HEAD
=======
        id={`${idBase}-btn-primera`}
>>>>>>> 809efa1 (Commit de inicio)
        className="btn btn-sm btn-outline-secondary"
        disabled={pagina === 1}
        onClick={() => setPagina(1)}
      >«</button>
      <button
<<<<<<< HEAD
=======
        id={`${idBase}-btn-anterior`}
>>>>>>> 809efa1 (Commit de inicio)
        className="btn btn-sm btn-outline-secondary"
        disabled={pagina === 1}
        onClick={() => setPagina(p => p - 1)}
      >‹</button>

      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
        <button
          key={n}
<<<<<<< HEAD
=======
          id={`${idBase}-btn-pagina-${n}`}
>>>>>>> 809efa1 (Commit de inicio)
          className={`btn btn-sm ${n === pagina ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setPagina(n)}
        >{n}</button>
      ))}

      <button
<<<<<<< HEAD
=======
        id={`${idBase}-btn-siguiente`}
>>>>>>> 809efa1 (Commit de inicio)
        className="btn btn-sm btn-outline-secondary"
        disabled={pagina === totalPaginas}
        onClick={() => setPagina(p => p + 1)}
      >›</button>
      <button
<<<<<<< HEAD
=======
        id={`${idBase}-btn-ultima`}
>>>>>>> 809efa1 (Commit de inicio)
        className="btn btn-sm btn-outline-secondary"
        disabled={pagina === totalPaginas}
        onClick={() => setPagina(totalPaginas)}
      >»</button>
    </div>
  );
};

export default Paginacion;
