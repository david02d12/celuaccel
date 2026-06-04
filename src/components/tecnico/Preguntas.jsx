import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Preguntas = ({ cerrarSesion, setVista }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({ ID_Consulta: '', ID_Usuario: '', Codigo_Producto: '', Pregunta: '', Fecha: '' });

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
    } catch (err) {
      console.error('Error al listar preguntas:', err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/preguntas/${url}`, form);
      listar();
      limpiar();
    } catch (err) {
      alert('Error al procesar la pregunta');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar pregunta?')) {
      try {
        await api.delete(`/preguntas/eliminar/${id}`);
        listar();
      } catch (err) {
        alert('Error al eliminar pregunta');
      }
    }
  };

  const limpiar = () => {
    setForm({ ID_Consulta: '', ID_Usuario: '', Codigo_Producto: '', Pregunta: '', Fecha: '' });
    setEnEdicion(false);
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Preguntas de Clientes" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="row">
          {/* FORMULARIO */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm border-0">
              <h5>{enEdicion ? 'Editar Consulta' : 'Nueva Consulta'}</h5>
              <input className="form-control mb-2" type="number" placeholder="ID Consulta"
                value={form.ID_Consulta} disabled={enEdicion}
                onChange={e => setForm({...form, ID_Consulta: e.target.value})} />
              <input className="form-control mb-2" placeholder="ID Usuario"
                value={form.ID_Usuario}
                onChange={e => setForm({...form, ID_Usuario: e.target.value})} />
              <input className="form-control mb-2" placeholder="Cód. Producto"
                value={form.Codigo_Producto}
                onChange={e => setForm({...form, Codigo_Producto: e.target.value})} />
              <textarea className="form-control mb-2" placeholder="Pregunta"
                value={form.Pregunta}
                onChange={e => setForm({...form, Pregunta: e.target.value})} />
              <input className="form-control mb-2" type="date"
                value={form.Fecha}
                onChange={e => setForm({...form, Fecha: e.target.value})} />
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
                  placeholder=" Buscar por usuario, producto o pregunta..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0 bg-white">
                  <thead className="table-dark">
                    <tr><th>ID</th><th>Usuario</th><th>Prod</th><th>Pregunta</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {datosPagina.map(p => (
                      <tr key={p.ID_Consulta}>
                        <td>{p.ID_Consulta}</td>
                        <td>{p.ID_Usuario}</td>
                        <td>{p.Codigo_Producto}</td>
                        <td>{p.Pregunta}</td>
                        <td>
                          <button className="btn btn-sm me-1 text-white" style={{ backgroundColor: '#121212' }}
                            onClick={() => { setForm({...p, Fecha: p.Fecha ? p.Fecha.split('T')[0] : ''}); setEnEdicion(true); }}>Editar</button>
                          <button className="btn btn-sm text-white" style={{ backgroundColor: '#DB0000' }}
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

export default Preguntas;