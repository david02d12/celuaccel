import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const IconDoc = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const Tipo = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [form, setForm] = useState({ Codigo_Documento: '', Nombre_Documento: '' });

  const tiposFiltrados = datos.filter(d =>
    String(d.Codigo_Documento).includes(busqueda) ||
    String(d.Nombre_Documento || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(tiposFiltrados, 8);

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3000);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/tipodocumento/listar');
      setDatos(res.data);
    } catch { mostrarToast('Error al cargar tipos de documento.', false); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/tipodocumento/${url}`, form);
      mostrarToast(enEdicion ? 'Tipo actualizado.' : 'Tipo registrado.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar la solicitud.', false); }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar este tipo de documento?')) {
      try {
        await api.delete(`/tipodocumento/eliminar/${id}`);
        mostrarToast('Tipo eliminado.'); listar();
      } catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => { setForm({ Codigo_Documento: '', Nombre_Documento: '' }); setEnEdicion(false); };

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '260px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Tipos de Documento" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Tipos de Documento</h4>
            <p className="mb-0 opacity-75">Configura los tipos de documento validos en el sistema</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{datos.length} tipos</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ width: 4, height: 20, background: 'var(--color-primary)', borderRadius: 2, display: 'inline-block' }}/>
                <h5 className="mb-0 fw-bold">{enEdicion ? 'Editar Tipo' : 'Nuevo Tipo'}</h5>
              </div>
              <input className="form-control mb-2" style={inputStyle} type="number" disabled={enEdicion}
                value={form.Codigo_Documento} placeholder="Codigo del Documento"
                onChange={e => setForm({...form, Codigo_Documento: e.target.value})} />
              <input className="form-control mb-3" style={inputStyle}
                value={form.Nombre_Documento} placeholder="Nombre del Documento"
                onChange={e => setForm({...form, Nombre_Documento: e.target.value})} />
              <button className="btn w-100 btn-primary fw-bold" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar Tipo'}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          {/* CARDS */}
          <div className="col-lg-8 col-12">
            <div className="mb-3">
              <input type="text" className="form-control" style={inputStyle}
                placeholder="Buscar por codigo o nombre..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>

            <div className="d-flex flex-column gap-2">
              {datosPagina.map(d => (
                <div key={d.Codigo_Documento} className="card border-0 shadow-sm fade-in"
                  style={{ borderLeft: '4px solid #0d6efd', borderRadius: 10 }}>
                  <div className="card-body p-3 d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 42, height: 42, backgroundColor: '#0d6efd20', color: '#0d6efd' }}>
                      <IconDoc />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{d.Nombre_Documento}</span>
                        <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>#{d.Codigo_Documento}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.77rem' }}
                        onClick={() => { setEnEdicion(true); setForm(d); }}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.77rem' }}
                        onClick={() => eliminar(d.Codigo_Documento)}>
                        Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

export default Tipo;