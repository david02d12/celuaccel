import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Mensajes = ({ cerrarSesion, setVista }) => {
  const [mensajes, setMensajes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    Codigo_Mensaje: '',
    Codigo_Chat: '',
    ID_Usuario: '',
    Fecha_Mensaje: '',
    Mensaje: '',
    Estado: 0
  });

  const config = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    listar();
  }, []);

  const listar = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/mensajes/listar', config());
      setMensajes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await axios[metodo](`http://localhost:3000/api/mensajes/${url}`, form, config());
      listar();
      limpiar();
    } catch (err) {
      alert('Error al procesar el mensaje');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar este mensaje?')) {
      try {
        await axios.delete(`http://localhost:3000/api/mensajes/eliminar/${id}`, config());
        listar();
      } catch (err) {
        alert('Error al eliminar el mensaje');
      }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Mensaje: '', Codigo_Chat: '', ID_Usuario: '', Fecha_Mensaje: '', Mensaje: '', Estado: 0 });
    setEnEdicion(false);
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Bandeja de Mensajes" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="row">
          {/* FORMULARIO */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm border-0">
              <h5>{enEdicion ? 'Editar Mensaje' : 'Nuevo Mensaje'}</h5>
              <input
                className="form-control mb-2"
                type="number"
                placeholder="Código Chat"
                value={form.Codigo_Chat}
                onChange={e => setForm({...form, Codigo_Chat: e.target.value})}
              />
              <input
                className="form-control mb-2"
                placeholder="ID Usuario"
                value={form.ID_Usuario}
                onChange={e => setForm({...form, ID_Usuario: e.target.value})}
              />
              <textarea
                className="form-control mb-2"
                placeholder="Escribe el mensaje..."
                value={form.Mensaje}
                onChange={e => setForm({...form, Mensaje: e.target.value})}
                rows="3"
              />
              <input
                className="form-control mb-2"
                type="date"
                value={form.Fecha_Mensaje}
                onChange={e => setForm({...form, Fecha_Mensaje: e.target.value})}
              />
              <select
                className="form-select mb-2"
                value={form.Estado}
                onChange={e => setForm({...form, Estado: e.target.value})}
              >
                <option value="0">No leído (0)</option>
                <option value="1">Leído (1)</option>
              </select>
              <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Enviar'}
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
                  placeholder=" Buscar por chat, usuario o contenido..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Chat</th>
                    <th>Usuario</th>
                    <th>Mensaje</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {mensajes.filter(m =>
                    String(m.Codigo_Chat).includes(busqueda) ||
                    String(m.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(m.Mensaje || '').toLowerCase().includes(busqueda.toLowerCase())
                  ).map(m => (
                    <tr key={m.Codigo_Mensaje}>
                      <td>{m.Codigo_Chat}</td>
                      <td>{m.ID_Usuario}</td>
                      <td className="small">{m.Mensaje}</td>
                      <td>
                        <span className={`badge ${Number(m.Estado) === 1 ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {Number(m.Estado) === 1 ? 'Leído' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm me-1 text-white" style={{ backgroundColor: '#121212' }}
                          onClick={() => { setForm(m); setEnEdicion(true); }}>
                          Editar
                        </button>
                        <button className="btn btn-sm text-white" style={{ backgroundColor: '#DB0000' }}
                          onClick={() => eliminar(m.Codigo_Mensaje)}>
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default Mensajes;