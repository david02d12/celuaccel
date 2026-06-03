import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Chats = ({ cerrarSesion, setVista }) => {
  const [chats, setChats] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    Codigo_Chat: '',
    ID_Usuario: '',
    ID_Servicio: ''
  });

  const config = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    listar();
  }, []);

  const listar = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/chats/listar', config());
      setChats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await axios[metodo](`http://localhost:3000/api/chats/${url}`, form, config());
      listar();
      limpiar();
    } catch (err) {
      alert('Error al procesar el chat');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar chat?')) {
      try {
        await axios.delete(`http://localhost:3000/api/chats/eliminar/${id}`, config());
        listar();
      } catch (err) {
        alert('Error al eliminar chat');
      }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Chat: '', ID_Usuario: '', ID_Servicio: '' });
    setEnEdicion(false);
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Administración de Canales" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="row">
          {/* FORMULARIO */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm border-0">
              <h5>{enEdicion ? 'Editar Chat' : 'Nuevo Chat'}</h5>
              <input
                className="form-control mb-2"
                placeholder="Código Chat"
                value={form.Codigo_Chat}
                disabled
                readOnly
              />
              <input
                className="form-control mb-2"
                placeholder="ID Usuario (Email/Username)"
                value={form.ID_Usuario}
                onChange={e => setForm({...form, ID_Usuario: e.target.value})}
              />
              <input
                className="form-control mb-2"
                type="number"
                placeholder="ID Servicio"
                value={form.ID_Servicio}
                onChange={e => setForm({...form, ID_Servicio: e.target.value})}
              />
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
                  placeholder=" Buscar por código, usuario o servicio..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Cod</th>
                    <th>ID Usuario</th>
                    <th>ID Servicio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {chats.filter(c =>
                    String(c.Codigo_Chat).includes(busqueda) ||
                    String(c.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(c.ID_Servicio).includes(busqueda)
                  ).map(c => (
                    <tr key={c.Codigo_Chat}>
                      <td>{c.Codigo_Chat}</td>
                      <td>{c.ID_Usuario}</td>
                      <td>{c.ID_Servicio}</td>
                      <td>
                        <button className="btn btn-sm me-1 text-white" style={{ backgroundColor: '#121212' }}
                          onClick={() => { setForm(c); setEnEdicion(true); }}>
                          Editar
                        </button>
                        <button className="btn btn-sm text-white" style={{ backgroundColor: '#DB0000' }}
                          onClick={() => eliminar(c.Codigo_Chat)}>
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

export default Chats;