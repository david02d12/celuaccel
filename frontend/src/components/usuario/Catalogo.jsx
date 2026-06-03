import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import axios from 'axios';
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

  const config = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get('http://localhost:3000/api/productos/listar', config()),
          axios.get('http://localhost:3000/api/categorias/listar', config()),
        ]);
        // RNF002: Solo mostrar activos en catálogo Y con stock disponible
        setProductos(pRes.data.filter(p => Number(p.Activo_Catalogo) === 1 && Number(p.Cantidad) > 0));
        setCategorias(cRes.data);

      } catch (err) {
        console.error('Error al cargar catálogo:', err);
      }
    };
    cargar();
  }, []);

  const enviarPregunta = async () => {
    if(!nuevaPregunta.trim()) return alert("Por favor escribe tu pregunta.");
    const usuario = localStorage.getItem('user') || '';
    if (!usuario) return alert("Error de sesión. Reconecta tu cuenta.");

    try {
      await axios.post('http://localhost:3000/api/preguntas/agregar', {
        ID_Consulta: null,
        ID_Usuario: usuario,
        Codigo_Producto: productoSel.Codigo_Producto,
        Pregunta: nuevaPregunta,
        Fecha: new Date().toISOString().split('T')[0]
      }, config());
      
      alert('¡Pregunta enviada! Un técnico la responderá pronto.');
      setHaciendoPregunta(false);
      setNuevaPregunta('');
      setProductoSel(null);
    } catch(err) {
      alert("Error al enviar la pregunta.");
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
        <div className="mb-4 p-4 rounded-3 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #DB0000, #8B0000)' }}>
          <h3 className="fw-bold mb-1"> Catálogo de Productos</h3>
          <p className="mb-0 opacity-75">Explora nuestra selección de dispositivos y accesorios</p>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Buscar producto por nombre o descripción..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
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
            <div style={{ fontSize: '4rem' }}></div>
            <h5 className="text-muted mt-3">No se encontraron productos</h5>
            <p className="text-muted">Intenta con otros términos de búsqueda o cambia el filtro de categoría.</p>
          </div>
        ) : (
          <div className="row g-4">
            {productosFiltrados.map(p => (
              <div key={p.Codigo_Producto} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card border-0 shadow-sm h-100"
                  style={{ transition: 'transform .2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => setProductoSel(p)}>
                  
                  {p.Imagen
                    ? <img src={p.Imagen} alt={p.Nombre}
                        style={{ height: '160px', width: '100%', objectFit: 'cover', borderRadius: '0.375rem 0.375rem 0 0' }}
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                      />
                    : null}
                  <div className="d-flex align-items-center justify-content-center"
                    style={{ height: '160px', backgroundColor: '#f0f0f0', borderRadius: '0.375rem 0.375rem 0 0', fontSize: '0.9rem', color: '#aaa', display: p.Imagen ? 'none' : 'flex' }}>
                    Sin imagen
                  </div>
                  <div className="card-body d-flex flex-column">
                    <span className="badge mb-2" style={{ backgroundColor: '#DB0000', width: 'fit-content' }}>
                      {nombreCategoria(p.ID_Categoria)}
                    </span>
                    <h6 className="fw-bold mb-1">{p.Nombre}</h6>
                    <p className="text-muted small flex-grow-1"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.Descripcion}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="fw-bold fs-5" style={{ color: '#DB0000' }}>${p.Precio}</span>
                      <span className={`badge ${p.Cantidad > 0 ? 'bg-success' : 'bg-secondary'}`}>
                        {p.Cantidad > 0 ? `Stock: ${p.Cantidad}` : 'Sin stock'}
                      </span>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0 pt-0">
                    <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#121212' }}
                      onClick={e => { e.stopPropagation(); setProductoSel(p); }}>
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {productoSel && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header" style={{ backgroundColor: '#DB0000' }}>
                <h5 className="modal-title text-white fw-bold">{productoSel.Nombre}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setProductoSel(null); setHaciendoPregunta(false); }}></button>
              </div>
              <div className="modal-body">
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr><td className="fw-bold text-muted">Código</td><td>{productoSel.Codigo_Producto}</td></tr>
                    <tr><td className="fw-bold text-muted">Categoría</td><td>{nombreCategoria(productoSel.ID_Categoria)}</td></tr>
                    <tr><td className="fw-bold text-muted">Precio</td>
                      <td className="fw-bold fs-5" style={{ color: '#DB0000' }}>${productoSel.Precio}</td></tr>
                    <tr><td className="fw-bold text-muted">Disponibilidad</td>
                      <td><span className={`badge ${productoSel.Cantidad > 0 ? 'bg-success' : 'bg-secondary'}`}>
                        {productoSel.Cantidad > 0 ? `${productoSel.Cantidad} unidades` : 'Sin stock'}
                      </span></td></tr>
                    <tr><td className="fw-bold text-muted pb-0">Descripción</td><td className="pb-0">{productoSel.Descripcion}</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div className="modal-footer border-0 pt-0 px-4 pb-4">
                {haciendoPregunta ? (
                  <div className="w-100 mt-2" style={{ animation: 'fadeIn 0.3s' }}>
                    <textarea 
                      className="form-control mb-3 shadow-sm" 
                      rows="3" 
                      placeholder="Escribe tu duda técnica sobre este equipo..."
                      value={nuevaPregunta}
                      onChange={e => setNuevaPregunta(e.target.value)}
                      autoFocus
                    />
                    <div className="d-flex gap-2 justify-content-end">
                      <button className="btn btn-secondary fw-bold" onClick={() => { setHaciendoPregunta(false); setNuevaPregunta(''); }}>
                        Cancelar
                      </button>
                      <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#DB0000' }} onClick={enviarPregunta}>
                        Enviar Pregunta al Técnico
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-100 d-flex justify-content-between">
                    <button className="btn btn-light fw-bold text-secondary" onClick={() => setProductoSel(null)}>Cerrar</button>
                    <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#DB0000' }}
                      onClick={() => setHaciendoPregunta(true)}>
                       Hacer una Pregunta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal" style={{ backgroundColor: '#121212' }}>
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
