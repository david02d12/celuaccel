import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Roles = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({ Codigo_Rol: '', Descripcion_Rol: '' });

  const rolesFiltrados = datos.filter(d =>
    String(d.Codigo_Rol).includes(busqueda) ||
    String(d.Descripcion_Rol || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(rolesFiltrados, 7);

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/roles/listar');
      setDatos(res.data);
    } catch (err) {
      console.error('Error al listar', err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/roles/${url}`, form);
      listar();
      limpiar();
    } catch (err) {
      alert('Error al procesar la solicitud.');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await api.delete(`/roles/eliminar/${id}`);
        listar();
      } catch (err) {
        alert('Error al eliminar rol');
      }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Rol: '', Descripcion_Rol: '' });
    setEnEdicion(false);
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Privilegios y Roles" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Privilegios y Roles</h4>
            <p className="mb-0 opacity-75">Configura los roles de acceso del sistema</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{datos.length} roles</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">{enEdicion ? 'Editar Rol' : 'Nuevo Rol'}</h5>
              <input className="form-control mb-2" style={inputStyle} type="number" disabled={enEdicion}
                value={form.Codigo_Rol} placeholder="Código Rol"
                onChange={e => setForm({...form, Codigo_Rol: e.target.value})} />
              <input className="form-control mb-3" style={inputStyle} value={form.Descripcion_Rol} placeholder="Descripción"
                onChange={e => setForm({...form, Descripcion_Rol: e.target.value})} />
              <button className="btn w-100 btn-primary" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar Rol'}
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
                  placeholder=" Buscar por código o descripción..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  style={inputStyle} />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPagina.map(d => (
                      <tr key={d.Codigo_Rol} className="stagger-item">
                        <td className="fw-bold">{d.Codigo_Rol}</td>
                        <td>{d.Descripcion_Rol}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => { setEnEdicion(true); setForm(d); }}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminar(d.Codigo_Rol)}>Borrar</button>
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

export default Roles;