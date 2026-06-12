import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
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

  useEffect(() => {
    listar();
  }, []);

  const listar = async () => {
    try {
      const res = await api.get('/chats/listar');
      setChats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/chats/${url}`, form);
      listar();
      limpiar();
    } catch (err) {
      alert('Error al procesar el chat');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar chat?')) {
      try {
        await api.delete(`/chats/eliminar/${id}`);
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

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Administración de Canales" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Administración de Canales</h4>
            <p className="mb-0 opacity-75">Configura y gestiona los canales de chat activos</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{chats.length} canales</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">{enEdicion ? 'Editar Chat' : 'Nuevo Chat'}</h5>
              <input
                className="form-control mb-2"
                style={inputStyle}
                placeholder="Código Chat"
                value={form.Codigo_Chat}
                disabled
                readOnly
              />
              <input
                className="form-control mb-2"
                style={inputStyle}
                placeholder="ID Usuario (Email/Username)"
                value={form.ID_Usuario}
                onChange={e => setForm({...form, ID_Usuario: e.target.value})}
              />
              <input
                className="form-control mb-2"
                style={inputStyle}
                type="number"
                placeholder="ID Servicio"
                value={form.ID_Servicio}
                onChange={e => setForm({...form, ID_Servicio: e.target.value})}
              />
              <button className="btn w-100 btn-primary" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar'}
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
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Buscar por código, usuario o servicio..."
                  value={busqueda} 
                  onChange={e => setBusqueda(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Cod</th>
                      <th>ID Usuario</th>
                      <th>ID Servicio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chats.filter(c =>
                      String(c.Codigo_Chat).includes(busqueda) ||
                      String(c.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                      String(c.ID_Servicio ?? '').includes(busqueda)
                    ).map(c => (
                      <tr key={c.Codigo_Chat} className="stagger-item">
                        <td>{c.Codigo_Chat}</td>
                        <td className="fw-bold">{c.ID_Usuario}</td>
                        <td>
                          {c.ID_Servicio
                            ? <span className="badge bg-primary">Servicio #{c.ID_Servicio}</span>
                            : <span className="badge bg-warning text-dark">Consulta catálogo</span>
                          }
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => { setForm(c); setEnEdicion(true); }}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-outline-danger"
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

export default Chats;