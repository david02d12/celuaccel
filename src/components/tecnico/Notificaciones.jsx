import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
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
    const texto = n.texto || '';
    const destino = n.ID_Usuario_Destino || '';
    return String(n.Codigo_Notificaciones).includes(busqueda) ||
           texto.toLowerCase().includes(busqueda.toLowerCase()) ||
           String(destino).toLowerCase().includes(busqueda.toLowerCase());
  });
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(notificacionesFiltradas, 7);

  useEffect(() => {
    listar();
  }, []);

  const listar = async () => {
    try {
      const res = await api.get('/notificaciones/listar');
      // El backend ya devuelve los campos estructurados: texto, leida, servicio, fecha, de
      setNotificaciones(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const guardar = async () => {
    if (!form.ID_Usuario_Destino || !form.Mensaje) return alert('Llena los campos destino y mensaje.');
    try {
      if (enEdicion) {
        // Actualiza solo el texto de la notificación (Tipo_Notificacion = texto plano)
        await api.put('/notificaciones/actualizar', {
          Codigo_Notificaciones: form.Codigo_Notificaciones,
          Tipo_Notificacion: form.Mensaje
        });
      } else {
        // Crea una notificación dirigida con los campos estructurados
        await api.post('/notificaciones/enviar', {
          ID_Usuario_Destino: form.ID_Usuario_Destino,
          ID_Servicio: form.ID_Servicio || null,
          Mensaje: form.Mensaje
        });
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
        await api.delete(`/notificaciones/eliminar/${id}`);
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

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Central de Notificaciones" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Central de Notificaciones</h4>
            <p className="mb-0 opacity-75">Envia y administra notificaciones globales o individuales</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{notificaciones.length} notificaciones</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">{enEdicion ? 'Editar Notificación' : 'Nueva Notificación'}</h5>
              
              <label className="small fw-bold text-muted mb-1">ID Usuario Destino *</label>
              <input
                className="form-control mb-2"
                style={inputStyle}
                placeholder="Documento del cliente (ej: 1234567)"
                value={form.ID_Usuario_Destino}
                onChange={e => setForm({...form, ID_Usuario_Destino: e.target.value})}
              />
              
              <label className="small fw-bold text-muted mb-1">ID Servicio (opcional)</label>
              <input
                className="form-control mb-2"
                style={inputStyle}
                type="number"
                placeholder="Número del servicio relacionado"
                value={form.ID_Servicio}
                onChange={e => setForm({...form, ID_Servicio: e.target.value})}
              />
              
              <label className="small fw-bold text-muted mb-1">Mensaje a Enviar *</label>
              <textarea
                className="form-control mb-2"
                style={inputStyle}
                rows="3"
                placeholder="Ej: Tu equipo ya está listo para retirar."
                value={form.Mensaje}
                onChange={e => setForm({...form, Mensaje: e.target.value})}
              />
              
              <button className="btn w-100 btn-primary mt-2" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Enviar Notificación'}
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
                  placeholder="Buscar por código o tipo de notificación..."
                  value={busqueda} 
                  onChange={e => setBusqueda(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Destino</th>
                      <th>Mensaje</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPagina.map(n => {
                      // Los campos vienen directos del backend estructurado
                      const destino = n.ID_Usuario_Destino || 'General';
                      const mensaje = n.texto || n.Tipo_Notificacion || '(sin texto)';
                      const leida   = n.leida === true;
                      return (
                        <tr key={n.Codigo_Notificaciones} className="stagger-item">
                          <td className="fw-bold">{n.Codigo_Notificaciones}</td>
                          <td>{destino}</td>
                          <td>
                            {mensaje}
                            {n.servicio && <span className="badge bg-secondary ms-1 small">Serv #{n.servicio}</span>}
                            {leida ? (
                              <span className="badge bg-success ms-1 small">Leída</span>
                            ) : (
                              <span className="badge bg-primary ms-1 small">Nueva</span>
                            )}
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary me-1"
                              onClick={() => {
                                setForm({
                                  Codigo_Notificaciones: n.Codigo_Notificaciones,
                                  ID_Usuario_Destino: destino === 'General' ? '' : destino,
                                  ID_Servicio: n.servicio || '',
                                  Mensaje: mensaje
                                });
                                setEnEdicion(true);
                              }}>
                              Editar
                            </button>
                            <button className="btn btn-sm btn-outline-danger"
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

export default Notificaciones;