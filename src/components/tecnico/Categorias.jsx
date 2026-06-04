import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';

const Categorias = ({ cerrarSesion, setVista }) => {
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({ ID_Categoria: '', Nombre_Categoria: '' });

  const categoriasFiltradas = categorias.filter(c =>
    String(c.ID_Categoria).includes(busqueda) ||
    String(c.Nombre_Categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(categoriasFiltradas, 7);

  

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/categorias/listar');
      setCategorias(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/categorias/${url}`, form);
      listar();
      limpiar();
    } catch (err) {
      alert('Error al procesar la categoría');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar categoría?')) {
      try {
        await api.delete(`/categorias/eliminar/${id}`);
        listar();
      } catch (err) {
        alert('Error al eliminar categoría');
      }
    }
  };

  const limpiar = () => {
    setForm({ ID_Categoria: '', Nombre_Categoria: '' });
    setEnEdicion(false);
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Categorías de Sistema" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="row">
          {/* FORMULARIO */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm border-0">
              <h5>{enEdicion ? 'Editar Categoría' : 'Nueva Categoría'}</h5>
              <input className="form-control mb-2" type="number" placeholder="ID Categoría"
                value={form.ID_Categoria} disabled={enEdicion}
                onChange={e => setForm({...form, ID_Categoria: e.target.value})} />
              <input className="form-control mb-2" placeholder="Nombre Categoría"
                value={form.Nombre_Categoria}
                onChange={e => setForm({...form, Nombre_Categoria: e.target.value})} />
              <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar'}
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
                  placeholder=" Buscar por ID o nombre de categoría..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0 bg-white">
                  <thead className="table-dark">
                    <tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {datosPagina.map(c => (
                      <tr key={c.ID_Categoria}>
                        <td>{c.ID_Categoria}</td>
                        <td>{c.Nombre_Categoria}</td>
                        <td>
                          <button className="btn btn-sm me-1 text-white" style={{ backgroundColor: '#121212' }}
                            onClick={() => { setForm(c); setEnEdicion(true); }}>Editar</button>
                          <button className="btn btn-sm text-white" style={{ backgroundColor: '#DB0000' }}
                            onClick={() => eliminar(c.ID_Categoria)}>Borrar</button>
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

export default Categorias;