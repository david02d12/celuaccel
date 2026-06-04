import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';

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

  return (
    <div>
      <Navbar titulo="CELUACCEL — Privilegios y Roles" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="row">
          {/* FORMULARIO */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm border-0">
              <h5 className="mb-3">{enEdicion ? 'Editar Rol' : 'Nuevo Rol'}</h5>
              <input className="form-control mb-2" type="number" disabled={enEdicion}
                value={form.Codigo_Rol} placeholder="Código Rol"
                onChange={e => setForm({...form, Codigo_Rol: e.target.value})} />
              <input className="form-control mb-3" value={form.Descripcion_Rol} placeholder="Descripción"
                onChange={e => setForm({...form, Descripcion_Rol: e.target.value})} />
              <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar Rol'}
              </button>
              {enEdicion && (
                <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>
              )}
            </div>
          </div>

          {/* TABLA */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm overflow-hidden">
              <div className="p-3 border-bottom">
                <input type="text" className="form-control"
                  placeholder=" Buscar por código o descripción..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr><th>Código</th><th>Descripción</th><th>Acciones</th></tr>
                  </thead>
                  <tbody className="bg-white">
                    {datosPagina.map(d => (
                      <tr key={d.Codigo_Rol}>
                        <td className="fw-bold">{d.Codigo_Rol}</td>
                        <td>{d.Descripcion_Rol}</td>
                        <td>
                          <button className="btn btn-sm me-1 text-white fw-bold" style={{ backgroundColor: '#121212' }}
                            onClick={() => { setEnEdicion(true); setForm(d); }}>Editar</button>
                          <button className="btn btn-sm text-white fw-bold" style={{ backgroundColor: '#DB0000' }}
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

export default Roles;