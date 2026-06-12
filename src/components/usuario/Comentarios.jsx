import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Comentarios = ({ cerrarSesion, setVista }) => {
  const miUsuario = localStorage.getItem('user') || '';
  const miRol = Number(localStorage.getItem('role')) || 2;

  const [comentarios, setComentarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    Codigo_Comentario: '',
    ID_Usuario: miUsuario,
    Comentario: '',
    Fecha_Comentario: '',
    Estrellas: 5
  });

  const listar = useCallback(async () => {
    try {
      const res = await api.get('/comentarios/listar');
      if (miRol === 2) {
        setComentarios(res.data.filter(c => c.ID_Usuario === miUsuario));
      } else {
        setComentarios(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [miRol, miUsuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    listar();
  }, [listar]);

  const guardar = async () => {
    try {
      if(!form.Comentario.trim()) return alert("El comentario no puede ir vacío.");
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      const datosFinales = { ...form, Fecha_Comentario: form.Fecha_Comentario || new Date().toISOString().split('T')[0] };
      await api[metodo](`/comentarios/${url}`, datosFinales);
      
      listar();
      limpiar();
    } catch {
      alert("Error al procesar el comentario");
    }
  };

  const eliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este comentario?")) {
      try {
        await api.delete(`/comentarios/eliminar/${id}`);
        listar();
      } catch (err) {
        alert("Error al eliminar comentario: " + err.response?.data?.error || "Desconocido");
      }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Comentario: '', ID_Usuario: miUsuario, Comentario: '', Fecha_Comentario: '', Estrellas: 5 });
    setEnEdicion(false);
  };

  const EstrellasDisplay = ({ cantidad = 5 }) => (
    <div className="d-flex mb-3 gap-1" style={{ color: '#FFD700' }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i < cantidad ? "currentColor" : "var(--color-border)"}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
    </div>
  );

  const [hoveredStar, setHoveredStar] = useState(0);

  const EstrellasInput = () => (
    <div className="d-flex mb-3 gap-1 align-items-center">
      <span className="small fw-bold text-muted me-2">Calificación:</span>
      {[...Array(5)].map((_, i) => {
        const activa = hoveredStar ? i < hoveredStar : i < form.Estrellas;
        return (
          <svg
            key={i}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={activa ? '#FFD700' : 'var(--color-border)'}
            style={{ cursor: 'pointer', transition: 'fill 0.15s ease', filter: activa ? 'drop-shadow(0 0 2px #FFD70088)' : 'none' }}
            onClick={() => setForm({ ...form, Estrellas: i + 1 })}
            onMouseEnter={() => setHoveredStar(i + 1)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        );
      })}
    </div>
  );

  const VerifiedBadge = () => (
    <span className="d-inline-flex align-items-center ms-2 text-success" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="me-1">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      Verificado
    </span>
  );

  const comentariosFiltrados = comentarios.filter(c =>
    String(c.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.Comentario || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(comentariosFiltrados, 7);

  return (
    <div>
      <Navbar titulo="CELUACCEL — Reseñas y Comentarios" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-center module-banner">
          <h3 className="fw-bold mb-1">Muro de Testimonios</h3>
          <p className="mb-0 opacity-75">Nuestra reputación construida a través de la confianza de nuestros clientes</p>
        </div>

        <div className="row">
          {/* PANEL DE FORMULARIO LATERAL */}
          <div className="col-md-4 mb-4">
            <div className="card p-4 shadow-sm border-0 position-sticky" style={{ top: '20px' }}>
              <h5 className="fw-bold mb-3">{enEdicion ? "Editar Reseña" : "Dejar un Testimonio"}</h5>
              <div className="text-muted small mb-3">
                Tu opinión es vital. Comparte tu experiencia con nosotros para ayudar a la comunidad Celuaccel.
              </div>
              
              <input 
                className="form-control mb-3" 
                placeholder="ID Usuario" 
                value={form.ID_Usuario} 
                disabled={enEdicion || miRol === 2}
                onChange={e => setForm({...form, ID_Usuario: e.target.value})} 
                style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              />
              <textarea 
                className="form-control mb-3" 
                placeholder="Escribe tu testimonio aquí..." 
                value={form.Comentario} 
                onChange={e => setForm({...form, Comentario: e.target.value})}
                rows="4"
                style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              />
              
              {EstrellasInput()}

              {miRol !== 2 && (
                <input 
                  className="form-control mb-3" 
                  type="date" 
                  title="Fecha Comentario"
                  value={form.Fecha_Comentario} 
                  onChange={e => setForm({...form, Fecha_Comentario: e.target.value})} 
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                />
              )}
              
              <button className="btn btn-primary w-100 py-2 shadow-sm" onClick={guardar}>
                {enEdicion ? "Actualizar Reseña" : "Publicar Experiencia"}
              </button>
              {enEdicion && (
                <button className="btn btn-outline-secondary w-100 mt-2" onClick={limpiar}>Cancelar Edición</button>
              )}
            </div>
          </div>

          {/* MURO DE TARJETAS */}
          <div className="col-md-8">
            <div className="card border-0 bg-transparent shadow-none">
              <div className="mb-4">
                <input 
                  type="text" 
                  className="form-control form-control-lg shadow-sm"
                  placeholder="Buscar palabras, referencias o un nombre de cliente..."
                  value={busqueda} 
                  onChange={e => setBusqueda(e.target.value)} 
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                />
              </div>

              {comentariosFiltrados.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted mt-3">Aún no hay reseñas para mostrar</h5>
                  <p className="text-muted">¡Anímate a ser el primero en dejar un testimonio estelar!</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {datosPagina.map(c => {
                    const inicial = c.ID_Usuario ? c.ID_Usuario.charAt(0).toUpperCase() : '?';
                    return (
                      <div key={c.Codigo_Comentario} className="card shadow-sm border-0 p-4 stagger-item">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold me-3 shadow-sm"
                                 style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-primary)', fontSize: '1.2rem', color: '#fff' }}>
                              {inicial}
                            </div>
                            <div>
                              <h6 className="fw-bold mb-0 d-flex align-items-center">
                                {c.ID_Usuario} {VerifiedBadge()}
                              </h6>
                            </div>
                          </div>
                          
                          <div className="d-flex gap-2">
                            {(miRol === 3 || c.ID_Usuario === miUsuario) && (
                              <>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setForm(c); setEnEdicion(true); }}>
                                  Editar
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(c.Codigo_Comentario)}>
                                  Borrar
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {EstrellasDisplay({ cantidad: c.Estrellas || 5 })}
                        <p className="mb-0" style={{ lineHeight: '1.6', color: 'var(--color-text)' }}>
                          "{c.Comentario}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ LATERAL */}
      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Menú de Navegación</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <Sidebar setVista={setVista} />
      </div>
    </div>
  );
};

export default Comentarios;