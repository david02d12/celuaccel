import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Tipo = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({ Codigo_Documento: '', Nombre_Documento: '' });

  const tiposFiltrados = datos.filter(d =>
    String(d.Codigo_Documento).includes(busqueda) ||
    String(d.Nombre_Documento || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(tiposFiltrados, 7);

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/tipodocumento/listar');
      setDatos(res.data);
    } catch (err) {
      console.error('Error al listar', err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/tipodocumento/${url}`, form);
      listar();
      limpiar();
    } catch (err) {
      alert('Error al procesar la solicitud.');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await api.delete(`/tipodocumento/eliminar/${id}`);
        listar();
      } catch (err) {
        alert('Error al eliminar tipo de documento');
      }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Documento: '', Nombre_Documento: '' });
    setEnEdicion(false);
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Tipos de Documento" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Tipos de Documento</h4>
            <p className="mb-0 opacity-75">Configura los tipos de documento válidos en el sistema</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{datos.length} tipos</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">{enEdicion ? 'Editar Documento' : 'Nuevo Documento'}</h5>
              <input className="form-control mb-2" style={inputStyle} type="number" disabled={enEdicion}
                value={form.Codigo_Documento} placeholder="Código Documento"
                onChange={e => setForm({...form, Codigo_Documento: e.target.value})} />
              <input className="form-control mb-3" style={inputStyle} value={form.Nombre_Documento} placeholder="Nombre Documento"
                onChange={e => setForm({...form, Nombre_Documento: e.target.value})} />
              <button className="btn w-100 btn-primary" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar Documento'}
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
                  placeholder=" Buscar por código o nombre de documento..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  style={inputStyle} />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre Documento</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPagina.map(d => (
                      <tr key={d.Codigo_Documento} className="stagger-item">
                        <td className="fw-bold">{d.Codigo_Documento}</td>
                        <td>{d.Nombre_Documento}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => { setEnEdicion(true); setForm(d); }}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminar(d.Codigo_Documento)}>Borrar</button>
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

export default Tipo;