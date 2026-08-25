import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
import { getLimitesGeneralesFecha } from '../../utils/validaciones';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ETAPAS = [
  { valor: '0',  label: 'Pendiente',   color: '#6c757d', pct: 10  },
  { valor: '1',  label: 'En proceso',  color: '#0d6efd', pct: 50  },
  { valor: '2',  label: 'Terminado',   color: '#198754', pct: 100 },
  { valor: '-1', label: 'Cancelado',   color: '#DB0000', pct: 0   },
];

const etapaInfo = (val) => ETAPAS.find(e => e.valor === String(val)) || ETAPAS[0];

const IconWrench = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IconBell = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconChat = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4h8v2"/>
  </svg>
);

const MENSAJES_RAPIDOS = [
  'Tu dispositivo ha sido recibido y registrado en el sistema.',
  'Hemos iniciado el diagnóstico de tu equipo.',
  'Tu dispositivo está en proceso de reparación.',
  'Tu equipo está en control de calidad, casi listo.',
  'Tu dispositivo está listo para retirar. Por favor acude a la tienda.',
  'Se requiere tu aprobación para proceder con la reparación.',
];

const Servicios = ({ cerrarSesion, setVista }) => {
  const userRole = Number(sessionStorage.getItem('role')) || 1;
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const { minDate, maxDate } = getLimitesGeneralesFecha();
  const [enEdicion, setEnEdicion] = useState(false);
  const [idServicioSel, setIdServicioSel] = useState(null);
  const [formServicio, setFormServicio] = useState({
    Descripcion: '', ID_Usuario: '', Precio: '', Precio_Repuestos: '', Precio_Mano_Obra: '', Movil_Nombre: '',
    Movil_Especificacion: '', Fecha: '', Etapa: '0'
  });
  const [modalNotif, setModalNotif] = useState(null);
  const [mensajeNotif, setMensajeNotif] = useState('');
  const [enviandoNotif, setEnviandoNotif] = useState(false);

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => { 
    listar(); 
    const searchId = sessionStorage.getItem('searchServicio');
    if (searchId) {
      setBusqueda(searchId);
      sessionStorage.removeItem('searchServicio');
    }
  }, []);

  const listar = async () => {
    try {
      const res = await api.get('/servicios/listar');
      setServicios(res.data);
    } catch { mostrarToast('Error al cargar los servicios.', false); }
  };

  const guardarServicio = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      const data = enEdicion ? { ...formServicio, ID_Servicio: idServicioSel } : { ...formServicio };
      const rep = Number(data.Precio_Repuestos) || 0;
      const mano = Number(data.Precio_Mano_Obra) || 0;
      if (data.Precio_Repuestos || data.Precio_Mano_Obra) {
        data.Precio = rep + mano;
      }
      await api[metodo](`/servicios/${url}`, data);
      mostrarToast(enEdicion ? 'Servicio actualizado.' : 'Nuevo servicio registrado.');
      listar(); limpiarServicio();
    } catch { mostrarToast('Error al procesar la solicitud.', false); }
  };

  const eliminarServicio = async (id) => {
    if (await confirmar('¿Eliminar este servicio?')) {
      try {
        await api.delete(`/servicios/eliminar/${id}`);
        mostrarToast('Servicio eliminado.'); listar();
      } catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiarServicio = () => {
    setFormServicio({ Descripcion: '', ID_Usuario: '', Precio: '', Precio_Repuestos: '', Precio_Mano_Obra: '', Movil_Nombre: '', Movil_Especificacion: '', Fecha: '', Etapa: '0' });
    setEnEdicion(false); setIdServicioSel(null);
  };

  const actualizarEtapa = async (servicio, nuevaEtapa) => {
    try {
      await api.put('/servicios/actualizar', { ...servicio, Etapa: nuevaEtapa, Fecha: servicio.Fecha ? servicio.Fecha.split('T')[0] : '' });
      mostrarToast('Etapa actualizada.'); listar();
    } catch { mostrarToast('Error al actualizar la etapa.', false); }
  };

  const enviarNotificacion = async () => {
    if (!mensajeNotif.trim() || !modalNotif) return;
    setEnviandoNotif(true);
    try {
      await api.post('/notificaciones/dirigida', {
        ID_Usuario_Destino: modalNotif.ID_Usuario,
        ID_Servicio: modalNotif.ID_Servicio,
        Mensaje: mensajeNotif.trim()
      });
      mostrarToast('Notificacion enviada al cliente.');
      setModalNotif(null); setMensajeNotif('');
    } catch { mostrarToast('Error al enviar la notificacion.', false); }
    finally { setEnviandoNotif(false); }
  };

  const generarPDF = () => {
    if (filtrados.length === 0) return mostrarToast('No hay servicios en la vista para exportar.', false);
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFillColor(219, 0, 0);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CELUACCEL', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte Operativo de Servicios Técnicos', 14, 23);
    
    doc.setFontSize(9);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 195, 15, { align: 'right' });
    doc.text(`Usuario que exporta: Rol ${userRole}`, 195, 22, { align: 'right' });

    // Resumen métricas
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const pendientes = filtrados.filter(s => String(s.Etapa) === '0').length;
    const enProceso = filtrados.filter(s => String(s.Etapa) === '1').length;
    const terminados = filtrados.filter(s => String(s.Etapa) === '2').length;
    const cancelados = filtrados.filter(s => String(s.Etapa) === '-1').length;

    doc.text(`Métricas de la vista actual:`, 14, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${filtrados.length} | Pendientes: ${pendientes} | En Proceso: ${enProceso} | Terminados: ${terminados} | Cancelados: ${cancelados}`, 14, 48);

    autoTable(doc, {
      startY: 55,
      head: [['ID', 'Cliente', 'Equipo', 'Falla', 'Estado', 'Precio', 'Fecha']],
      body: filtrados.map(s => [
        s.ID_Servicio,
        s.ID_Usuario || '—',
        `${s.Movil_Nombre || ''} ${s.Movil_Especificacion || ''}`.trim() || '—',
        s.Descripcion || '—',
        etapaInfo(s.Etapa).label,
        s.Precio ? `$${s.Precio}` : '—',
        s.Fecha ? String(s.Fecha).split('T')[0] : '—',
      ]),
      headStyles: { fillColor: [219, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      columnStyles: { 3: { cellWidth: 50 } } // Dar más espacio a la descripción
    });

    doc.save(`Reporte_Servicios_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarToast('Reporte PDF descargado.', true);
  };

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  const filtrados = servicios.filter(s =>
    String(s.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(s.Movil_Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(s.ID_Usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(s.Precio || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(s.Movil_Especificacion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(s.ID_Servicio).includes(busqueda)
  );

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
        <nav aria-label="breadcrumb" className="mb-3 fade-in-up">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
            <li className="breadcrumb-item">
              <a href="#" className="text-decoration-none text-muted" onClick={(e) => { e.preventDefault(); setVista('home'); }}>Inicio</a>
            </li>
            <li className="breadcrumb-item active fw-bold" aria-current="page" style={{ color: 'var(--color-primary)' }}>
              Gestión de Reparaciones
            </li>
          </ol>
        </nav>
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Gestion de Reparaciones</h4>
            <p className="mb-0 opacity-75">Registra y actualiza el seguimiento de cada servicio tecnico</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-danger fw-bold" style={{ backgroundColor: 'var(--color-surface)' }} fs-6">{servicios.length} servicios</span>
            <button className="btn btn-sm btn-light text-danger fw-bold d-flex align-items-center gap-1" onClick={generarPDF}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              PDF
            </button>
          </div>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ width: 4, height: 20, background: 'var(--color-primary)', borderRadius: 2, display: 'inline-block' }}/>
                <h5 className="mb-0 fw-bold">{enEdicion ? 'Editar Servicio' : 'Nuevo Registro'}</h5>
              </div>
              <input className="form-control mb-2" style={inputStyle} value={formServicio.Descripcion} placeholder="Descripcion del problema" disabled={userRole === 1} onChange={e => setFormServicio({...formServicio, Descripcion: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} value={formServicio.ID_Usuario} placeholder="Documento del cliente" disabled={userRole === 1} onChange={e => setFormServicio({...formServicio, ID_Usuario: e.target.value})} />
              
              <div className="d-flex gap-2 mb-2">
                <input className="form-control" style={inputStyle} type="number" min="0" value={formServicio.Precio_Repuestos} placeholder="Repuestos ($)" onChange={e => {
                  const v = e.target.value;
                  if (v === '' || Number(v) >= 0) setFormServicio({...formServicio, Precio_Repuestos: v});
                }} />
                <input className="form-control" style={inputStyle} type="number" min="0" value={formServicio.Precio_Mano_Obra} placeholder="Mano Obra ($)" onChange={e => {
                  const v = e.target.value;
                  if (v === '' || Number(v) >= 0) setFormServicio({...formServicio, Precio_Mano_Obra: v});
                }} />
              </div>
              <div className="mb-2 p-2 rounded text-center fw-bold" style={{ backgroundColor: 'var(--color-surfaceAlt)', color: 'var(--color-primary)' }}>
                Total: ${ (Number(formServicio.Precio_Repuestos) || 0) + (Number(formServicio.Precio_Mano_Obra) || 0) }
              </div>
              <input className="form-control mb-2" style={inputStyle} value={formServicio.Movil_Nombre} placeholder="Marca y Modelo del Movil" disabled={userRole === 1} onChange={e => setFormServicio({...formServicio, Movil_Nombre: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} value={formServicio.Movil_Especificacion} placeholder="Especificacion tecnica" disabled={userRole === 1} onChange={e => setFormServicio({...formServicio, Movil_Especificacion: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Fecha de ingreso</label>
              <input className="form-control mb-2" style={inputStyle} type="date" value={formServicio.Fecha} min={minDate} max={maxDate} disabled={userRole === 1} onChange={e => setFormServicio({...formServicio, Fecha: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Etapa</label>
              <select className="form-select mb-3" style={inputStyle} value={formServicio.Etapa} onChange={e => setFormServicio({...formServicio, Etapa: e.target.value})}>
                {ETAPAS.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
              </select>
              <button className="btn w-100 btn-primary fw-bold" onClick={guardarServicio}>
                {enEdicion ? 'Actualizar Servicio' : 'Guardar Servicio'}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiarServicio}>Cancelar</button>}
            </div>
          </div>

          {/* CARDS DE SERVICIOS */}
          <div className="col-lg-8 col-12">
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Buscar por ID, descripción, cliente, móvil, precio o especificación..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} style={inputStyle} />
            </div>

            {filtrados.length === 0 ? (
              <div className="text-center py-5 fade-in border rounded shadow-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <div className="mb-3 text-muted" style={{ opacity: 0.5 }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h5 className="fw-bold mb-2 text-muted">Aún no hay servicios</h5>
                <p className="text-muted small mb-4">No encontramos reparaciones para mostrar en este momento.</p>
                {userRole !== 1 && (
                  <button className="btn btn-outline-primary fw-bold" onClick={() => document.querySelector('input[placeholder="Descripcion del problema"]')?.focus()}>
                    ¡Haz clic aquí para crear el primero!
                  </button>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filtrados.map(s => {
                  const info = etapaInfo(String(s.Etapa));
                  return (
                    <div key={s.ID_Servicio} className="card border-0 shadow-sm fade-in"
                      style={{ borderLeft: `4px solid ${info.color}`, borderRadius: 12, overflow: 'hidden' }}>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                          <div>
                            <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Servicio #{s.ID_Servicio}</span>
                            <span className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>
                              {s.Fecha ? String(s.Fecha).split('T')[0] : ''}
                            </span>
                          </div>
                          <span className="badge" style={{ backgroundColor: info.color, fontSize: '0.72rem', fontWeight: 700 }}>
                            {info.label}
                          </span>
                        </div>

                        <div className="row g-2 mb-2" style={{ fontSize: '0.84rem' }}>
                          <div className="col-6">
                            <span className="text-muted">Dispositivo</span><br/>
                            <strong>{s.Movil_Nombre || '—'}</strong>
                          </div>
                          <div className="col-6">
                            <span className="text-muted">Cliente</span><br/>
                            <button className="btn btn-link p-0 fw-bold"
                              style={{ color: 'var(--color-primary)', fontSize: '0.84rem' }}
                              onClick={() => setVista('perfil', { perfilId: s.ID_Usuario })}>
                              {s.ID_Usuario}
                            </button>
                          </div>
                          <div className="col-8">
                            <span className="text-muted">Descripcion</span><br/>
                            <span>{s.Descripcion || '—'}</span>
                          </div>
                          <div className="col-4 text-end">
                            <span className="text-muted">Precio</span><br/>
                            <strong style={{ color: '#198754' }}>${s.Precio}</strong>
                          </div>
                        </div>

                        {String(s.Etapa) !== '-1' && (
                          <div className="mb-3" style={{ height: 5, borderRadius: 99, backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                            <div style={{ width: `${info.pct}%`, height: '100%', backgroundColor: info.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                          </div>
                        )}

                        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                          <select className="form-select form-select-sm"
                            value={String(s.Etapa)}
                            style={{ width: 'auto', minWidth: 160, fontSize: '0.77rem', fontWeight: 600, ...inputStyle }}
                            onChange={e => actualizarEtapa(s, e.target.value)}>
                            {ETAPAS.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
                          </select>

                          <div className="d-flex gap-1">
                            {Number(s.Etapa) === -1 ? (
                              <button
                                className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
                                style={{ fontSize: '0.77rem', opacity: 0.5, cursor: 'not-allowed' }}
                                disabled
                                title="Chat no disponible — servicio cancelado">
                                <IconChat /> Chat
                              </button>
                            ) : (
                              <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                style={{ fontSize: '0.77rem' }}
                                onClick={() => { sessionStorage.setItem('chatInfo', JSON.stringify({ ID_Servicio: s.ID_Servicio })); setVista('chatVista'); }}>
                                <IconChat /> Chat
                              </button>
                            )}
                            <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                              style={{ fontSize: '0.77rem' }}
                              onClick={() => { setModalNotif({ ID_Usuario: s.ID_Usuario, ID_Servicio: s.ID_Servicio }); setMensajeNotif(''); }}>
                              <IconBell /> Notificar
                            </button>
                            <button id="btn-editar-servicio" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                              style={{ fontSize: '0.77rem' }}
                              onClick={() => { setEnEdicion(true); setIdServicioSel(s.ID_Servicio); setFormServicio({...s, Fecha: s.Fecha ? s.Fecha.split('T')[0] : '', Etapa: String(s.Etapa)}); }}>
                              <IconWrench /> Editar
                            </button>
                            <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              style={{ fontSize: '0.77rem' }}
                              onClick={() => eliminarServicio(s.ID_Servicio)}>
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Menu de Navegacion</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <Sidebar setVista={setVista} />
      </div>

      {modalNotif && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header text-white" style={{ background: 'linear-gradient(135deg, #DB0000, #8B0000)' }}>
                <h5 className="modal-title fw-bold">Notificar al Cliente</h5>
                <button className="btn-close btn-close-white" onClick={() => setModalNotif(null)} />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Enviando a: <strong>{modalNotif.ID_Usuario}</strong> &middot; Servicio <strong>#{modalNotif.ID_Servicio}</strong>
                </p>
                <p className="small fw-bold mb-2">Mensajes rapidos:</p>
                <div className="d-flex flex-column gap-1 mb-3">
                  {MENSAJES_RAPIDOS.map((m, i) => (
                    <button key={i} className="btn btn-sm btn-outline-secondary text-start" onClick={() => setMensajeNotif(m)}>{m}</button>
                  ))}
                </div>
                <textarea className="form-control" rows={3} placeholder="O escribe un mensaje personalizado..."
                  value={mensajeNotif} onChange={e => setMensajeNotif(e.target.value)} style={inputStyle} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalNotif(null)}>Cancelar</button>
                <button className="btn btn-success fw-bold" disabled={!mensajeNotif.trim() || enviandoNotif} onClick={enviarNotificacion}>
                  {enviandoNotif ? 'Enviando...' : 'Enviar Notificacion'}
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