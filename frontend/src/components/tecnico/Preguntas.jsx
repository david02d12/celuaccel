import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const IconReply = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
  </svg>
);

const Preguntas = ({ cerrarSesion, setVista }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [form, setForm] = useState({ ID_Consulta: '', ID_Usuario: '', Codigo_Producto: '', Pregunta: '', Fecha: '', Respuesta: '' });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3000);
  };

  const preguntasFiltradas = preguntas.filter(p =>
    String(p.ID_Consulta).includes(busqueda) ||
    String(p.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Codigo_Producto || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.Pregunta || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(preguntasFiltradas, 7);

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/preguntas/listar');
      setPreguntas(res.data);
    } catch { mostrarToast('Error al cargar preguntas.', false); }
  };

  const guardar = async () => {
    try {
      if (enEdicion) {
        const tecnico = localStorage.getItem('userId') || localStorage.getItem('user');
        await api.put('/preguntas/actualizar', {
          ...form,
          ID_Tecnico_Responde: tecnico,
          Fecha_Respuesta: form.Respuesta ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
        });
      } else {
        await api.post('/preguntas/agregar', form);
      }
      mostrarToast(enEdicion ? 'Respuesta guardada.' : 'Consulta registrada.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar la pregunta.', false); }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar pregunta?')) {
      try {
        await api.delete(`/preguntas/eliminar/${id}`);
        mostrarToast('Pregunta eliminada.'); listar();
      } catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => {
    setForm({ ID_Consulta: '', ID_Usuario: '', Codigo_Producto: '', Pregunta: '', Fecha: '', Respuesta: '' });
    setEnEdicion(false);
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '260px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Preguntas de Clientes" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Preguntas sobre Equipos</h4>
            <p className="mb-0 opacity-75">Responde las inquietudes técnicas de los clientes sobre los productos</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{preguntas.length} preguntas</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">{enEdicion ? 'Editar Consulta' : 'Nueva Consulta'}</h5>
              <input className="form-control mb-2" style={inputStyle} type="number" placeholder="ID Consulta"
                value={form.ID_Consulta} disabled={enEdicion}
                onChange={e => setForm({...form, ID_Consulta: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="ID Usuario"
                value={form.ID_Usuario}
                onChange={e => setForm({...form, ID_Usuario: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} placeholder="Cód. Producto"
                value={form.Codigo_Producto}
                onChange={e => setForm({...form, Codigo_Producto: e.target.value})} />
              <textarea className="form-control mb-2" style={inputStyle} placeholder="Pregunta"
                value={form.Pregunta}
                onChange={e => setForm({...form, Pregunta: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Fecha</label>
              <input className="form-control mb-2" style={inputStyle} type="date"
                value={form.Fecha}
                onChange={e => setForm({...form, Fecha: e.target.value})} />
              {/* C5 FIX: Campo Respuesta — solo visible en modo edición */}
              {enEdicion && (
                <>
                  <label className="small fw-bold text-muted mb-1 mt-2">Respuesta del Técnico</label>
                  <textarea className="form-control mb-2" style={inputStyle} rows={3}
                    placeholder="Escribe tu respuesta al cliente..."
                    value={form.Respuesta}
                    onChange={e => setForm({...form, Respuesta: e.target.value})} />
                </>
              )}
              <button className="btn w-100 btn-primary mt-2" onClick={guardar}>
                {enEdicion ? 'Guardar Respuesta' : 'Guardar'}
              </button>
              {enEdicion && (
                <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>
              )}
            </div>
          </div>

          {/* TABLA */}
          <div className="col-lg-8 col-12">
            <div className="card border-0 shadow-sm overflow-hidden">
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <input type="text" className="form-control"
                  placeholder=" Buscar por usuario, producto o pregunta..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  style={inputStyle} />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Producto</th>
                      <th>Pregunta</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPagina.map(p => (
                      <tr key={p.ID_Consulta} className="stagger-item">
                        <td>{p.ID_Consulta}</td>
                        <td className="fw-bold">{p.ID_Usuario}</td>
                        <td>{p.Codigo_Producto}</td>
                        <td>
                          <div>{p.Pregunta}</div>
                          {p.Respuesta && (
                            <div className="mt-1 p-2 rounded-2 small d-flex align-items-start gap-1"
                              style={{ backgroundColor: 'var(--color-primary-lt)', color: 'var(--color-primary)', fontStyle: 'italic' }}>
                              <IconReply />
                              <span>{p.Respuesta}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${p.Respuesta ? 'bg-success' : 'bg-secondary'} mb-1 d-block`} style={{ fontSize: '0.7rem' }}>
                            {p.Respuesta ? 'Respondida' : 'Sin responder'}
                          </span>
                          <button className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => { setForm({...p, Fecha: p.Fecha ? p.Fecha.split('T')[0] : '', Respuesta: p.Respuesta || ''}); setEnEdicion(true); }}>Responder</button>
                          <button className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminar(p.ID_Consulta)}>Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3">
                <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
              </div>
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

export default Preguntas;