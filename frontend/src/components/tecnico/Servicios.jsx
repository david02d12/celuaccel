import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// M2 FIX: Incluye TODOS los valores posibles de Etapa de la BD
// (datos de prueba usaban 40, 60, 70, 80 que no estaban mapeados)
const ETAPAS = [
  { valor: '0',   label: 'Recibido',            color: '#6c757d', pct: 0   },
  { valor: '25',  label: 'En Diagnóstico',       color: '#0d6efd', pct: 25  },
  { valor: '40',  label: 'En Diagnóstico',       color: '#0d6efd', pct: 40  },
  { valor: '50',  label: 'En Reparación',        color: '#f59e0b', pct: 50  },
  { valor: '60',  label: 'En Reparación',        color: '#f59e0b', pct: 60  },
  { valor: '70',  label: 'Control de Calidad',   color: '#8b5cf6', pct: 70  },
  { valor: '75',  label: 'Control de Calidad',   color: '#8b5cf6', pct: 75  },
  { valor: '80',  label: 'Control de Calidad',   color: '#8b5cf6', pct: 80  },
  { valor: '100', label: 'Listo para Retirar',   color: '#198754', pct: 100 },
  { valor: '-1',  label: 'Cancelado',            color: '#DB0000', pct: 0   },
];

const EtapaBadge = ({ etapa }) => {
  const info = ETAPAS.find(e => e.valor === String(etapa)) || ETAPAS[0];
  const mostrarBarra = String(etapa) !== '-1';
  return (
    <div style={{ minWidth: '140px' }}>
      <span className={`badge-etapa badge-etapa-${etapa}`} style={{ fontSize: '0.76rem' }}>
        {info.label}
      </span>
      {mostrarBarra && (
        <div className="etapa-progress" style={{ marginTop: '5px', backgroundColor: 'var(--color-border)' }}>
          <div
            className="etapa-progress-bar"
            style={{ width: `${info.pct}%`, backgroundColor: info.color }}
          />
        </div>
      )}
    </div>
  );
};

const Servicios = ({ cerrarSesion, setVista }) => {
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [idServicioSel, setIdServicioSel] = useState(null);
  const [formServicio, setFormServicio] = useState({
    Descripcion: '', ID_Usuario: '', Precio: '', Movil_Nombre: '',
    Movil_Especificacion: '', Fecha: '', Etapa: '0'
  });
  
  const [modalNotif, setModalNotif] = useState(null);
  const [mensajeNotif, setMensajeNotif] = useState('');
  const [enviandoNotif, setEnviandoNotif] = useState(false);

  const MENSAJES_RAPIDOS = [
    'Tu dispositivo ha sido recibido y registrado en el sistema.',
    'Hemos iniciado el diagnóstico de tu equipo.',
    'Tu dispositivo está en proceso de reparación.',
    'Tu equipo está en control de calidad, casi listo.',
    'Tu dispositivo está listo para retirar. Por favor acude a la tienda.',
    'Se requiere tu aprobación para proceder con la reparación.',
  ];

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/servicios/listar');
      setServicios(res.data);
    } catch (err) { mostrarToast('Error al cargar los servicios.', false); }
  };

  const guardarServicio = async () => {
    try {
      const url = enEdicion ? "actualizar" : "agregar";
      const metodo = enEdicion ? 'put' : 'post';
      const data = enEdicion ? { ...formServicio, ID_Servicio: idServicioSel } : formServicio;
      await api[metodo](`/servicios/${url}`, data);
      mostrarToast(enEdicion ? 'Servicio actualizado correctamente.' : 'Nuevo servicio registrado.');
      listar();
      limpiarServicio();
    } catch (err) { mostrarToast("Error al procesar la solicitud. Verifica los datos.", false); }
  };

  const eliminarServicio = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await api.delete(`/servicios/eliminar/${id}`);
        mostrarToast('Servicio eliminado del sistema.');
        listar();
      } catch (err) { mostrarToast('Error al eliminar el servicio.', false); }
    }
  };

  const limpiarServicio = () => {
    setFormServicio({ Descripcion: '', ID_Usuario: '', Precio: '', Movil_Nombre: '', Movil_Especificacion: '', Fecha: '', Etapa: '0' });
    setEnEdicion(false);
    setIdServicioSel(null);
  };

  const actualizarEtapa = async (servicio, nuevaEtapa) => {
    try {
      await api.put('/servicios/actualizar', {
        ...servicio,
        Etapa: nuevaEtapa,
        Fecha: servicio.Fecha ? servicio.Fecha.split('T')[0] : ''
      });
      mostrarToast(`Etapa actualizada a: ${etapaLabel(nuevaEtapa)}`);
      listar();
    } catch (err) {
      mostrarToast('Error al actualizar la etapa.', false);
    }
  };

  const enviarNotificacion = async () => {
    if (!mensajeNotif.trim() || !modalNotif) return;
    setEnviandoNotif(true);
    try {
      await api.post('/notificaciones/enviar', {
        ID_Usuario_Destino: modalNotif.ID_Usuario,
        ID_Servicio: modalNotif.ID_Servicio,
        Mensaje: mensajeNotif.trim()
      });
      mostrarToast('Notificación enviada al cliente correctamente.');
      setModalNotif(null);
      setMensajeNotif('');
    } catch (err) {
      mostrarToast('Error al enviar la notificación.', false);
    } finally {
      setEnviandoNotif(false);
    }
  };

  const etapaLabel = (val) => ETAPAS.find(e => e.valor === String(val))?.label || `Etapa ${val}`;

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '290px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Control de Reparaciones" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Gestión de Reparaciones</h4>
            <p className="mb-0 opacity-75">Registra y actualiza el seguimiento de cada servicio técnico</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{servicios.length} servicios</span>
        </div>

        <div className="row">
          {/* PANEL IZQUIERDO: FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="mb-3 fw-bold">{enEdicion ? "Editar Servicio" : "Nuevo Registro"}</h5>
              <input className="form-control mb-2" style={inputStyle} value={formServicio.Descripcion} placeholder="Descripción del problema" onChange={e => setFormServicio({...formServicio, Descripcion: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} value={formServicio.ID_Usuario} placeholder="Documento del cliente" onChange={e => setFormServicio({...formServicio, ID_Usuario: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} type="number" value={formServicio.Precio} placeholder="Precio ($)" onChange={e => setFormServicio({...formServicio, Precio: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} value={formServicio.Movil_Nombre} placeholder="Marca y Modelo del Móvil" onChange={e => setFormServicio({...formServicio, Movil_Nombre: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} value={formServicio.Movil_Especificacion} placeholder="Especificación técnica del equipo" onChange={e => setFormServicio({...formServicio, Movil_Especificacion: e.target.value})} />
              
              <label className="small text-muted fw-bold mb-1">Fecha de ingreso</label>
              <input className="form-control mb-2" style={inputStyle} type="date" value={formServicio.Fecha} onChange={e => setFormServicio({...formServicio, Fecha: e.target.value})} />
              
              <label className="small text-muted fw-bold mb-1">Etapa del servicio</label>
              <select className="form-select mb-3" style={inputStyle} value={formServicio.Etapa} onChange={e => setFormServicio({...formServicio, Etapa: e.target.value})}>
                {ETAPAS.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
              </select>
              
              <button className="btn w-100 btn-primary" onClick={guardarServicio}>
                {enEdicion ? "Actualizar Servicio" : "Guardar Servicio"}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiarServicio}>Cancelar</button>}
            </div>
          </div>

          {/* PANEL DERECHO: TABLA */}
          <div className="col-lg-8 col-12">
            <div className="card shadow-sm overflow-hidden">
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Buscar por descripción, móvil o usuario..."
                  value={busqueda} 
                  onChange={e => setBusqueda(e.target.value)} 
                  style={inputStyle}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Descripción</th>
                      <th>Móvil</th>
                      <th>Cliente</th>
                      <th>Precio</th>
                      <th>Etapa</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicios.filter(s =>
                      String(s.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                      String(s.Movil_Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                      String(s.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                      String(s.ID_Servicio).includes(busqueda)
                    ).map(s => (
                      <tr key={s.ID_Servicio} className="fade-in">
                        <td className="fw-bold">{s.ID_Servicio}</td>
                        <td>{s.Descripcion}</td>
                        <td>{s.Movil_Nombre}</td>
                        <td>
                          <button
                            className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                            style={{ color: 'var(--color-primary)' }}
                            title="Ver perfil del cliente"
                            onClick={() => setVista('perfil', { perfilId: s.ID_Usuario })}
                          >
                            {s.ID_Usuario}
                          </button>
                        </td>
                        <td className="text-success fw-bold">${s.Precio}</td>
                        <td style={{ minWidth: '165px' }}>
                          <EtapaBadge etapa={String(s.Etapa)} />
                          <select
                            className="form-select form-select-sm mt-2"
                            value={String(s.Etapa)}
                            style={{ fontSize: '0.74rem', fontWeight: 600, ...inputStyle }}
                            onChange={e => actualizarEtapa(s, e.target.value)}
                          >
                            {ETAPAS.map(e => (
                              <option key={e.valor} value={e.valor}>{e.label}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              type="button" 
                              data-bs-toggle="dropdown" 
                              data-bs-boundary="viewport"
                              data-bs-strategy="fixed"
                              aria-expanded="false"
                              style={{ fontSize: '0.74rem', fontWeight: 600 }}
                            >
                              Acciones
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                              <li>
                                <button
                                  className="dropdown-item fw-semibold text-primary"
                                  onClick={() => {
                                    localStorage.setItem('chatInfo', JSON.stringify({ ID_Servicio: s.ID_Servicio }));
                                    setVista('chatVista');
                                  }}
                                >
                                  Chat
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item fw-semibold text-success"
                                  onClick={() => { 
                                    setModalNotif({ ID_Usuario: s.ID_Usuario, ID_Servicio: s.ID_Servicio }); 
                                    setMensajeNotif(''); 
                                  }}
                                >
                                  Notificar
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" style={{ borderColor: 'var(--color-border)' }} /></li>
                              <li>
                                <button 
                                  className="dropdown-item fw-semibold" 
                                  onClick={() => {
                                    setEnEdicion(true);
                                    setIdServicioSel(s.ID_Servicio);
                                    setFormServicio({...s, Fecha: s.Fecha ? s.Fecha.split('T')[0] : '', Etapa: String(s.Etapa)});
                                  }}
                                >
                                  Editar
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item fw-semibold text-danger" 
                                  onClick={() => eliminarServicio(s.ID_Servicio)}
                                >
                                  Borrar
                                </button>
                              </li>
                            </ul>
                          </div>
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

      {/* MODAL DE NOTIFICACIÓN AL CLIENTE */}
      {modalNotif && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header text-white bg-primary">
                <h5 className="modal-title fw-bold">Notificar al Cliente</h5>
                <button className="btn-close btn-close-white" onClick={() => setModalNotif(null)} />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Enviando a: <strong>{modalNotif.ID_Usuario}</strong> &middot; Servicio <strong>#{modalNotif.ID_Servicio}</strong>
                </p>
                <p className="small fw-bold mb-2">Mensajes rápidos:</p>
                <div className="d-flex flex-column gap-1 mb-3">
                  {MENSAJES_RAPIDOS.map((m, i) => (
                    <button key={i} className="btn btn-sm btn-outline-secondary text-start"
                      onClick={() => setMensajeNotif(m)}>
                      {m}
                    </button>
                  ))}
                </div>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="O escribe un mensaje personalizado..."
                  value={mensajeNotif}
                  onChange={e => setMensajeNotif(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalNotif(null)}>Cancelar</button>
                <button
                  className="btn btn-success fw-bold"
                  disabled={!mensajeNotif.trim() || enviandoNotif}
                  onClick={enviarNotificacion}>
                  {enviandoNotif ? 'Enviando...' : 'Enviar Notificación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;