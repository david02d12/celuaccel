import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import axios from 'axios';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Notificaciones = ({ cerrarSesion, setVista }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    Codigo_Notificaciones: '',
    ID_Usuario_Destino: '',
    ID_Servicio: '',
    Mensaje: ''
  });

  const notificacionesFiltradas = notificaciones.filter(n => {
    const texto = n.parsed?.texto || n.Tipo_Notificacion || '';
    const para = n.parsed?.para || '';
    return String(n.Codigo_Notificaciones).includes(busqueda) || 
           texto.toLowerCase().includes(busqueda.toLowerCase()) ||
           String(para).toLowerCase().includes(busqueda.toLowerCase());
  });
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(notificacionesFiltradas, 7);

  const config = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    listar();
  }, []);

  const listar = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/notificaciones/listar', config());
      const dataParsed = res.data.map(n => {
        try {
          return { ...n, parsed: JSON.parse(n.Tipo_Notificacion) };
        } catch {
          return { ...n, parsed: null };
        }
      });
      setNotificaciones(dataParsed);
    } catch (err) {
      console.error(err);
    }
  };

  const guardar = async () => {
    if (!form.ID_Usuario_Destino || !form.Mensaje) return alert('Llena los campos destino y mensaje.');
    try {
      if (enEdicion) {
         // Si está en edición (usamos actualizar endpoint con JSON stringificado manual)
         const payload = { para: form.ID_Usuario_Destino, texto: form.Mensaje, leida: false, fecha: new Date().toISOString().split('T')[0] };
         await axios.put(`http://localhost:3000/api/notificaciones/actualizar`, {
           Codigo_Notificaciones: form.Codigo_Notificaciones,
           Tipo_Notificacion: JSON.stringify(payload)
         }, config());
      } else {
         await axios.post(`http://localhost:3000/api/notificaciones/enviar`, form, config());
      }
      listar();
      limpiar();
    } catch (err) {
      alert('Error al enviar la notificación.');
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar esta notificación?')) {
      try {
        await axios.delete(`http://localhost:3000/api/notificaciones/eliminar/${id}`, config());
        listar();
      } catch (err) {
        alert('Error al eliminar la notificación');
      }
    }
  };

  const limpiar = () => {
    setForm({ Codigo_Notificaciones: '', ID_Usuario_Destino: '', ID_Servicio: '', Mensaje: '' });
    setEnEdicion(false);
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Central de Notificaciones" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="row">
          {/* FORMULARIO */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm border-0">
              <h5>{enEdicion ? 'Editar Notificación' : 'Nueva Notificación'}</h5>
              <label className="small fw-bold">ID Usuario Destino *</label>
              <input
                className="form-control mb-2"
                placeholder="Documento del cliente (ej: 1234567)"
                value={form.ID_Usuario_Destino}
                onChange={e => setForm({...form, ID_Usuario_Destino: e.target.value})}
              />
              <label className="small fw-bold">ID Servicio (opcional)</label>
              <input
                className="form-control mb-2"
                type="number"
                placeholder="Número del servicio relacionado"
                value={form.ID_Servicio}
                onChange={e => setForm({...form, ID_Servicio: e.target.value})}
              />
              <label className="small fw-bold">Mensaje a Enviar *</label>
              <textarea
                className="form-control mb-2"
                rows="3"
                placeholder="Ej: Tu equipo ya está listo para retirar."
                value={form.Mensaje}
                onChange={e => setForm({...form, Mensaje: e.target.value})}
              />
              <button className="btn w-100 text-white fw-bold mt-2" style={{ backgroundColor: '#DB0000' }} onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Enviar Notificación'}
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
                  placeholder=" Buscar por código o tipo de notificación..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Código</th>
                      <th>Destino</th>
                      <th>Mensaje</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {datosPagina.map(n => {
                      const p = n.parsed || {};
                      const destino = p.para || 'General';
                      const mensaje = p.texto || '(sin texto)';
                      const leida = p.leida === true;
                      return (
                        <tr key={n.Codigo_Notificaciones}>
                          <td className="fw-bold">{n.Codigo_Notificaciones}</td>
                          <td>{destino}</td>
                          <td>
                            {mensaje}
                            {p.servicio && <span className="badge bg-secondary ms-1 small">Serv #{p.servicio}</span>}
                            {leida
                              ? <span className="badge bg-success ms-1 small">Leída</span>
                              : <span className="badge ms-1 small text-white" style={{ backgroundColor: '#DB0000' }}>Nueva</span>
                            }
                          </td>
                          <td>
                            <button className="btn btn-sm me-1 text-white" style={{ backgroundColor: '#121212' }}
                              onClick={() => { setForm({ Codigo_Notificaciones: n.Codigo_Notificaciones, ID_Usuario_Destino: destino === 'General' ? '' : destino, ID_Servicio: p.servicio || '', Mensaje: mensaje }); setEnEdicion(true); }}>
                              Editar
                            </button>
                            <button className="btn btn-sm text-white" style={{ backgroundColor: '#DB0000' }}
                              onClick={() => eliminar(n.Codigo_Notificaciones)}>
                              Borrar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

export default Notificaciones;