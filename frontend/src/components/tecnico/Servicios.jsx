import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ETAPAS = [
  { valor: '0',   label: 'Recibido'           },
  { valor: '25',  label: 'En Diagnóstico'     },
  { valor: '50',  label: 'En Reparación'      },
  { valor: '75',  label: 'Control de Calidad' },
  { valor: '100', label: 'Listo para Retirar' },
  { valor: '-1',  label: 'Cancelado'           },
];

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
  // Modal de notificación
  const [modalNotif, setModalNotif] = useState(null); // { ID_Usuario, ID_Servicio }
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

  const config = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/servicios/listar', config());
      setServicios(res.data);
    } catch (err) { mostrarToast('Error al cargar los servicios.', false); }
  };

  const guardarServicio = async () => {
    try {
      const url = enEdicion ? "actualizar" : "agregar";
      const metodo = enEdicion ? 'put' : 'post';
      const data = enEdicion ? { ...formServicio, ID_Servicio: idServicioSel } : formServicio;
      await axios[metodo](`http://localhost:3000/api/servicios/${url}`, data, config());
      mostrarToast(enEdicion ? 'Servicio actualizado correctamente.' : 'Nuevo servicio registrado.');
      listar();
      limpiarServicio();
    } catch (err) { mostrarToast("Error al procesar la solicitud. Verifica los datos.", false); }
  };

  const eliminarServicio = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await axios.delete(`http://localhost:3000/api/servicios/eliminar/${id}`, config());
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

  // Actualizacion rápida de etapa directamente desde la tabla
  const actualizarEtapa = async (servicio, nuevaEtapa) => {
    try {
      await axios.put('http://localhost:3000/api/servicios/actualizar', {
        ...servicio,
        Etapa: nuevaEtapa,
        Fecha: servicio.Fecha ? servicio.Fecha.split('T')[0] : ''
      }, config());
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
      await axios.post('http://localhost:3000/api/notificaciones/enviar', {
        ID_Usuario_Destino: modalNotif.ID_Usuario,
        ID_Servicio: modalNotif.ID_Servicio,
        Mensaje: mensajeNotif.trim()
      }, config());
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

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Control de Reparaciones" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 p-4 rounded-3 text-white d-flex justify-content-between align-items-center flex-wrap gap-2"
          style={{ background: 'linear-gradient(135deg, #DB0000, #8B0000)' }}>
          <div>
            <h4 className="fw-bold mb-1">Gestión de Reparaciones</h4>
            <p className="mb-0 opacity-75">Registra y actualiza el seguimiento de cada servicio técnico</p>
          </div>
          <span className="badge bg-light text-danger fw-bold fs-6">{servicios.length} servicios</span>
        </div>

        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="mb-3 fw-bold">{enEdicion ? "Editar Servicio" : "Nuevo Registro"}</h5>
              <input className="form-control mb-2" value={formServicio.Descripcion} placeholder="Descripción del problema" onChange={e => setFormServicio({...formServicio, Descripcion: e.target.value})} />
              <input className="form-control mb-2" value={formServicio.ID_Usuario} placeholder="Documento del cliente" onChange={e => setFormServicio({...formServicio, ID_Usuario: e.target.value})} />
              <input className="form-control mb-2" type="number" value={formServicio.Precio} placeholder="Precio ($)" onChange={e => setFormServicio({...formServicio, Precio: e.target.value})} />
              <input className="form-control mb-2" value={formServicio.Movil_Nombre} placeholder="Marca y Modelo del Móvil" onChange={e => setFormServicio({...formServicio, Movil_Nombre: e.target.value})} />
              <input className="form-control mb-2" value={formServicio.Movil_Especificacion} placeholder="Especificación técnica del equipo" onChange={e => setFormServicio({...formServicio, Movil_Especificacion: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Fecha de ingreso</label>
              <input className="form-control mb-2" type="date" value={formServicio.Fecha} onChange={e => setFormServicio({...formServicio, Fecha: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Etapa del servicio</label>
              <select className="form-select mb-3" value={formServicio.Etapa} onChange={e => setFormServicio({...formServicio, Etapa: e.target.value})}>
                {ETAPAS.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
              </select>
              <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={guardarServicio}>
                {enEdicion ? "Actualizar Servicio" : "Guardar Servicio"}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiarServicio}>Cancelar</button>}
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow-sm overflow-hidden">
              <div className="p-3 border-bottom">
                <input type="text" className="form-control"
                  placeholder="Buscar por descripción, móvil o usuario..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr><th>ID</th><th>Descripción</th><th>Móvil</th><th>Cliente</th><th>Precio</th><th>Etapa</th><th>Acciones</th></tr>
                </thead>
                <tbody className="bg-white">
                  {servicios.filter(s =>
                    String(s.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(s.Movil_Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(s.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(s.ID_Servicio).includes(busqueda)
                  ).map(s => (
                    <tr key={s.ID_Servicio}>
                      <td className="fw-bold">{s.ID_Servicio}</td>
                      <td>{s.Descripcion}</td>
                      <td>{s.Movil_Nombre}</td>
                      <td>
                        <button
                          className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                          style={{ color: '#DB0000' }}
                          title="Ver perfil del cliente"
                          onClick={() => setVista('perfil', { perfilId: s.ID_Usuario })}
                        >
                          {s.ID_Usuario}
                        </button>
                      </td>
                      <td className="text-success fw-bold">${s.Precio}</td>
                      <td style={{ minWidth: '150px' }}>
                        {/* Selector de etapa directo — actualiza sin abrir formulario */}
                        <select
                          className="form-select form-select-sm"
                          value={String(s.Etapa)}
                          style={{
                            borderColor: String(s.Etapa) === '-1' ? '#dc3545' :
                                         String(s.Etapa) === '100' ? '#198754' : '#0d6efd',
                            fontWeight: '600',
                            fontSize: '0.78rem'
                          }}
                          onChange={e => actualizarEtapa(s, e.target.value)}
                        >
                          {ETAPAS.map(e => (
                            <option key={e.valor} value={e.valor}>{e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {/* Abrir chat con el cliente de este servicio */}
                          <button
                            className="btn btn-sm text-white fw-bold"
                            style={{ backgroundColor: '#0d6efd' }}
                            title="Chatear con el cliente"
                            onClick={() => {
                              localStorage.setItem('chatInfo', JSON.stringify({ ID_Servicio: s.ID_Servicio }));
                              setVista('chatVista');
                            }}
                          >
                            Chat
                          </button>
                          {/* Enviar notificación al cliente */}
                          <button
                            className="btn btn-sm text-white fw-bold"
                            style={{ backgroundColor: '#198754' }}
                            title="Enviar notificación al cliente"
                            onClick={() => { setModalNotif({ ID_Usuario: s.ID_Usuario, ID_Servicio: s.ID_Servicio }); setMensajeNotif(''); }}
                          >
                            Notificar
                          </button>
                          <button className="btn btn-sm text-white fw-bold" style={{ backgroundColor: '#121212' }} onClick={() => {
                            setEnEdicion(true);
                            setIdServicioSel(s.ID_Servicio);
                            setFormServicio({...s, Fecha: s.Fecha ? s.Fecha.split('T')[0] : '', Etapa: String(s.Etapa)});
                          }}>Editar</button>
                          <button className="btn btn-sm text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={() => eliminarServicio(s.ID_Servicio)}>Borrar</button>
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

      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal" style={{ backgroundColor: '#121212' }}>
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
              <div className="modal-header text-white" style={{ backgroundColor: '#DB0000' }}>
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
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalNotif(null)}>Cancelar</button>
                <button
                  className="btn text-white fw-bold"
                  style={{ backgroundColor: '#198754' }}
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