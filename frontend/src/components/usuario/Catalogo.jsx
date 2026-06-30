import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Catalogo = ({ cerrarSesion, setVista }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [productoSel, setProductoSel] = useState(null);
  const [haciendoPregunta, setHaciendoPregunta] = useState(false);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [enviandoPregunta, setEnviandoPregunta] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          api.get('/productos/listar'),
          api.get('/categorias/listar'),
        ]);
        // Solo mostrar activos en catálogo Y con stock disponible
        setProductos(pRes.data.filter(p => Number(p.Activo_Catalogo) === 1 && Number(p.Cantidad) > 0));
        setCategorias(cRes.data);
      } catch (err) {
        console.error('Error al cargar catálogo:', err);
      }
    };
    cargar();
  }, []);

  const enviarPregunta = async () => {
    if (!nuevaPregunta.trim()) return alert('Por favor escribe tu pregunta.');
    const usuario = localStorage.getItem('user') || '';
    if (!usuario) return alert('Error de sesión. Reconecta tu cuenta.');

    setEnviandoPregunta(true);
    try {
      // 1. Registrar pregunta en el historial (tabla Pregunta)
      await api.post('/preguntas/agregar', {
        ID_Consulta: null,
        ID_Usuario: usuario,
        Codigo_Producto: productoSel.Codigo_Producto,
        Pregunta: nuevaPregunta,
        Fecha: new Date().toISOString().split('T')[0]
      });

      // 2. Crear un chat de consulta (sin servicio asociado)
      const chatRes = await api.post('/chats/agregar', {
        ID_Usuario: usuario,
        ID_Servicio: null
      });
      const codigoChat = chatRes.data.id;

      // 3. Enviar la pregunta como primer mensaje del chat
      await api.post('/mensajes/agregar', {
        Codigo_Chat: codigoChat,
        ID_Usuario: usuario,
        Mensaje: `Consulta sobre "${productoSel.Nombre}": ${nuevaPregunta}`,
        Estado: 'Enviado'
      });

      // 4. Guardar referencia del chat para que ChatVista lo abra automáticamente
      localStorage.setItem('chatInfo', JSON.stringify({ Codigo_Chat: codigoChat }));

      // 5. Redirigir al chat en tiempo real con el técnico
      setHaciendoPregunta(false);
      setNuevaPregunta('');
      setProductoSel(null);
      setVista('chatVista');
    } catch (err) {
      console.error(err);
      alert('Error al enviar la pregunta. Intenta de nuevo.');
    } finally {
      setEnviandoPregunta(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.Descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === '' || String(p.ID_Categoria) === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  const nombreCategoria = (id) => {
    const cat = categorias.find(c => String(c.ID_Categoria) === String(id));
    return cat ? cat.Nombre_Categoria : 'Sin categoría';
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Catálogo de Productos" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER PRINCIPAL */}
        <div className="mb-4 text-center module-banner">
          <h3 className="fw-bold mb-1">Catálogo de Productos</h3>
          <p className="mb-0 opacity-75">Explora nuestra selección de dispositivos y accesorios</p>
        </div>

        {/* CONTROLES DE BÚSQUEDA Y FILTRADO */}
        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--color-border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                style={{ borderColor: 'var(--color-border)' }}
                placeholder="Buscar producto por nombre o descripción..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select 
              className="form-select" 
              style={{ borderColor: 'var(--color-border)' }}
              value={categoriaFiltro} 
              onChange={e => setCategoriaFiltro(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.ID_Categoria} value={String(c.ID_Categoria)}>{c.Nombre_Categoria}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-muted mb-3">
          Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{productos.length}</strong> productos
        </p>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted mt-3">No se encontraron productos</h5>
            <p className="text-muted">Intenta con otros términos de búsqueda o cambia el filtro de categoría.</p>
          </div>
        ) : (
          <div className="row g-4">
            {productosFiltrados.map((p) => (
              <div key={p.Codigo_Producto} className="col-sm-6 col-md-4 col-lg-3 stagger-item">
                <div
                  className="card border-0 shadow-sm h-100 card-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setProductoSel(p)}
                >
                  {p.Imagen ? (
                    <img
                      src={p.Imagen}
                      alt={p.Nombre}
                      style={{ height: '160px', width: '100%', objectFit: 'cover', borderRadius: '14px 14px 0 0' }}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className="img-placeholder"
                    style={{ display: p.Imagen ? 'none' : 'flex', borderRadius: '14px 14px 0 0' }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2"/>
                      <circle cx="12" cy="17" r="1"/>
                    </svg>
                    <span>Sin imagen</span>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <span className="badge bg-primary mb-2" style={{ width: 'fit-content' }}>
                      {nombreCategoria(p.ID_Categoria)}
                    </span>
                    <h6 className="fw-bold mb-1">{p.Nombre}</h6>
                    <p
                      className="text-muted small flex-grow-1"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {p.Descripcion}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="fw-bold fs-5" style={{ color: 'var(--color-primary)' }}>${p.Precio}</span>
                      <span className={`badge ${p.Cantidad > 0 ? 'bg-success' : 'bg-secondary'}`}>
                        {p.Cantidad > 0 ? `Stock: ${p.Cantidad}` : 'Sin stock'}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer bg-transparent border-0 pt-0">
                    <button
                      className="btn w-100 btn-primary"
                      onClick={e => { e.stopPropagation(); setProductoSel(p); }}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETALLES MODAL */}
      {productoSel && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white fw-bold">{productoSel.Nombre}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setProductoSel(null); setHaciendoPregunta(false); }}></button>
              </div>
              <div className="modal-body">
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr><td className="fw-bold text-muted">Código</td><td>{productoSel.Codigo_Producto}</td></tr>
                    <tr><td className="fw-bold text-muted">Categoría</td><td>{nombreCategoria(productoSel.ID_Categoria)}</td></tr>
                    <tr>
                      <td className="fw-bold text-muted">Precio</td>
                      <td className="fw-bold fs-5" style={{ color: 'var(--color-primary)' }}>${productoSel.Precio}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Disponibilidad</td>
                      <td>
                        <span className={`badge ${productoSel.Cantidad > 0 ? 'bg-success' : 'bg-secondary'}`}>
                          {productoSel.Cantidad > 0 ? `${productoSel.Cantidad} unidades` : 'Sin stock'}
                        </span>
                      </td>
                    </tr>
                    <tr><td className="fw-bold text-muted pb-0">Descripción</td><td className="pb-0">{productoSel.Descripcion}</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div className="modal-footer border-0 pt-0 px-4 pb-4">
                {haciendoPregunta ? (
                  <div className="w-100 mt-2" style={{ animation: 'fadeIn 0.3s' }}>
                    <div className="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2" style={{ borderRadius: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                      Tu pregunta abrirá un chat directo con el técnico.
                    </div>
                    <textarea 
                      className="form-control mb-3 shadow-sm" 
                      rows="3" 
                      placeholder="Escribe tu duda técnica sobre este producto..."
                      value={nuevaPregunta}
                      onChange={e => setNuevaPregunta(e.target.value)}
                      disabled={enviandoPregunta}
                      autoFocus
                    />
                    <div className="d-flex gap-2 justify-content-end">
                      <button className="btn btn-secondary fw-bold" disabled={enviandoPregunta} onClick={() => { setHaciendoPregunta(false); setNuevaPregunta(''); }}>
                        Cancelar
                      </button>
                      <button className="btn btn-primary fw-bold px-4" onClick={enviarPregunta} disabled={enviandoPregunta}>
                        {enviandoPregunta
                          ? (<><span className="spinner-border spinner-border-sm me-2" />Conectando con técnico...</>)
                          : 'Chatear con el Técnico'
                        }
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-100 d-flex justify-content-between">
                    <button className="btn btn-light fw-bold text-secondary" onClick={() => setProductoSel(null)}>Cerrar</button>
                    <button className="btn btn-primary fw-bold px-4" onClick={() => setHaciendoPregunta(true)}>
                      Preguntar al Técnico
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

export default Catalogo;
