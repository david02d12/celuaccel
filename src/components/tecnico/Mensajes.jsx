import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
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

  useEffect(() => {
    listar();
  }, []);

  const listar = async () => {
    try {
      const res = await api.get('/mensajes/listar');
      setMensajes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/mensajes/${url}`, form);
      listar();
      limpiar();
    } catch (err) {
      alert('Error al procesar el mensaje');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar este mensaje?')) {
      try {
        await api.delete(`/mensajes/eliminar/${id}`);
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

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Bandeja de Mensajes" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Bandeja de Mensajes</h4>
            <p className="mb-0 opacity-75">Controla y edita los mensajes enviados en los chats</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{mensajes.length} mensajes</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">{enEdicion ? 'Editar Mensaje' : 'Nuevo Mensaje'}</h5>
              <input
                className="form-control mb-2"
                style={inputStyle}
                type="number"
                placeholder="Código Chat"
                value={form.Codigo_Chat}
                onChange={e => setForm({...form, Codigo_Chat: e.target.value})}
              />
              <input
                className="form-control mb-2"
                style={inputStyle}
                placeholder="ID Usuario"
                value={form.ID_Usuario}
                onChange={e => setForm({...form, ID_Usuario: e.target.value})}
              />
              <textarea
                className="form-control mb-2"
                style={inputStyle}
                placeholder="Escribe el mensaje..."
                value={form.Mensaje}
                onChange={e => setForm({...form, Mensaje: e.target.value})}
                rows="3"
              />
              <label className="small text-muted fw-bold mb-1">Fecha</label>
              <input
                className="form-control mb-2"
                style={inputStyle}
                type="date"
                value={form.Fecha_Mensaje}
                onChange={e => setForm({...form, Fecha_Mensaje: e.target.value})}
              />
              <label className="small text-muted fw-bold mb-1">Estado</label>
              <select
                className="form-select mb-3"
                style={inputStyle}
                value={form.Estado}
                onChange={e => setForm({...form, Estado: e.target.value})}
              >
                <option value="0">No leído</option>
                <option value="1">Leído</option>
              </select>
              <button className="btn w-100 btn-primary" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Enviar'}
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
                  placeholder=" Buscar por chat, usuario o contenido..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  style={inputStyle} />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Chat</th>
                      <th>Usuario</th>
                      <th>Mensaje</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mensajes.filter(m =>
                      String(m.Codigo_Chat).includes(busqueda) ||
                      String(m.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                      String(m.Mensaje || '').toLowerCase().includes(busqueda.toLowerCase())
                    ).map(m => (
                      <tr key={m.Codigo_Mensaje} className="stagger-item">
                        <td>{m.Codigo_Chat}</td>
                        <td className="fw-bold">{m.ID_Usuario}</td>
                        <td className="small">{m.Mensaje}</td>
                        <td>
                          <span className={`badge ${Number(m.Estado) === 1 ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {Number(m.Estado) === 1 ? 'Leído' : 'Pendiente'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => { setForm(m); setEnEdicion(true); }}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-outline-danger"
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

export default Mensajes;