import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const IconTag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const Categorias = ({ cerrarSesion, setVista }) => {
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [form, setForm] = useState({ ID_Categoria: '', Nombre_Categoria: '' });

  const categoriasFiltradas = categorias.filter(c =>
    String(c.ID_Categoria).includes(busqueda) ||
    String(c.Nombre_Categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(categoriasFiltradas, 8);

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3000);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/categorias/listar');
      setCategorias(res.data);
    } catch { mostrarToast('Error al cargar categorias.', false); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/categorias/${url}`, form);
      mostrarToast(enEdicion ? 'Categoria actualizada.' : 'Categoria creada.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar la categoria.', false); }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar esta categoria?')) {
      try {
        await api.delete(`/categorias/eliminar/${id}`);
        mostrarToast('Categoria eliminada.'); listar();
      } catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => { setForm({ ID_Categoria: '', Nombre_Categoria: '' }); setEnEdicion(false); };

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  const PALETTE = ['#DB0000','#0d6efd','#198754','#f59e0b','#8b5cf6','#0dcaf0','#fd7e14','#20c997'];

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '260px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Categorias de Sistema" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Categorias de Productos</h4>
            <p className="mb-0 opacity-75">Define y edita las categorias del catalogo</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{categorias.length} categorias</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ width: 4, height: 20, background: 'var(--color-primary)', borderRadius: 2, display: 'inline-block' }}/>
                <h5 className="mb-0 fw-bold">{enEdicion ? 'Editar Categoria' : 'Nueva Categoria'}</h5>
              </div>
              <input className="form-control mb-2" style={inputStyle} type="number"
                placeholder="ID Categoria" value={form.ID_Categoria} disabled={enEdicion}
                onChange={e => setForm({...form, ID_Categoria: e.target.value})} />
              <input className="form-control mb-3" style={inputStyle}
                placeholder="Nombre de la Categoria" value={form.Nombre_Categoria}
                onChange={e => setForm({...form, Nombre_Categoria: e.target.value})} />
              <button className="btn w-100 btn-primary fw-bold" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar'}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          {/* CARDS */}
          <div className="col-lg-8 col-12">
            <div className="mb-3">
              <input type="text" className="form-control" style={inputStyle}
                placeholder="Buscar por ID o nombre..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>

            <div className="d-flex flex-column gap-2">
              {datosPagina.map((c, idx) => {
                const color = PALETTE[idx % PALETTE.length];
                return (
                  <div key={c.ID_Categoria} className="card border-0 shadow-sm fade-in"
                    style={{ borderLeft: `4px solid ${color}`, borderRadius: 10 }}>
                    <div className="card-body p-3 d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 42, height: 42, backgroundColor: `${color}20`, color }}>
                        <IconTag />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{c.Nombre_Categoria}</span>
                          <span className="badge" style={{ backgroundColor: color, fontSize: '0.7rem' }}>#{c.ID_Categoria}</span>
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.77rem' }}
                          onClick={() => { setForm(c); setEnEdicion(true); }}>
                          Editar
                        </button>
                        <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.77rem' }}
                          onClick={() => eliminar(c.ID_Categoria)}>
                          Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPaginas > 1 && (
              <div className="mt-3">
                <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Menu de Navegacion</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <Sidebar setVista={setVista} />
      </div>
    </div>
  );
};

export default Categorias;