import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const MiServicio = ({ cerrarSesion, setVista }) => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formNuevo, setFormNuevo] = useState({ Descripcion: '', Movil_Nombre: '', Movil_Especificacion: '' });
  
  const usuario = localStorage.getItem('user') || '';

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: '', tipo: 'success' }), 3500);
  };

  const generarPDF = () => {
    if (servicios.length === 0) return mostrarToast('No tienes servicios para exportar.', 'danger');
    const doc = new jsPDF();

    doc.setFillColor(219, 0, 0);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CELUACCEL — Mi Historial de Servicios', 14, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${usuario}    Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 22);

    const ETAPAS_MAP = { '0': 'Recibido', '25': 'En Diagnóstico', '50': 'En Reparación', '75': 'Control de Calidad', '100': 'Listo', '-1': 'Cancelado' };

    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Móvil', 'Descripción', 'Especificación', 'Estado', 'Precio', 'Fecha']],
      body: servicios.map(s => [
        s.ID_Servicio,
        s.Movil_Nombre || '—',
        s.Descripcion || '—',
        s.Movil_Especificacion || '—',
        ETAPAS_MAP[String(s.Etapa)] || `Etapa ${s.Etapa}`,
        s.Precio ? `$${s.Precio}` : '—',
        s.Fecha ? String(s.Fecha).split('T')[0] : '—',
      ]),
      headStyles: { fillColor: [219, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    doc.save(`historial_servicios_${usuario}_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarToast('PDF generado y descargado.');
  };

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    if (!usuario) return;
    setCargando(true);
    try {
      const res = await api.get(`/servicios/mis-servicios/${usuario}`);
      setServicios(res.data);
    } catch (err) {
      mostrarToast('Error al cargar tus servicios. Verifica tu conexión.', 'danger');
    } finally {
      setCargando(false);
    }
  };

  const cancelarServicio = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar este servicio? Esta acción no se puede deshacer.')) return;
    try {
      await api.patch(`/servicios/cancelar/${id}`, {});
      mostrarToast('Servicio cancelado correctamente.', 'warning');
      cargar();
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo cancelar el servicio.';
      mostrarToast(msg, 'danger');
    }
  };

  const crearServicio = async () => {
    if (!formNuevo.Movil_Nombre || !formNuevo.Descripcion || !formNuevo.Movil_Especificacion) {
      return mostrarToast('Por favor completa todos los campos del celular.', 'warning');
    }
    
    try {
      const datosNuevo = {
        ...formNuevo,
        ID_Usuario: usuario,
        Precio: 0,
        Etapa: 0,
        Fecha: new Date().toISOString().split('T')[0]
      };
      await api.post('/servicios/agregar', datosNuevo);
      mostrarToast('¡Solicitud enviada con éxito! Un coordinador revisará.', 'success');
      setMostrarFormulario(false);
      setFormNuevo({ Descripcion: '', Movil_Nombre: '', Movil_Especificacion: '' });
      cargar();
    } catch (err) {
      mostrarToast('Error al crear la solicitud de servicio.', 'danger');
    }
  };

  const etapaInfo = (etapa) => {
    const e = Number(etapa);
    if (e === -1) return { texto: 'Cancelado',          color: '#6c757d', porcentaje: 0  };
    if (e === 0)  return { texto: 'Recibido',            color: '#0d6efd', porcentaje: 10 };
    if (e <= 25)  return { texto: 'En Diagnóstico',      color: '#0dcaf0', porcentaje: 25 };
    if (e <= 50)  return { texto: 'En Reparación',       color: '#ffc107', porcentaje: 50 };
    if (e <= 75)  return { texto: 'Control de Calidad',  color: '#fd7e14', porcentaje: 75 };
    if (e === 100) return { texto: 'Listo para Retirar', color: '#198754', porcentaje: 100 };
    return { texto: `En proceso (${e}%)`, color: '#6c757d', porcentaje: e };
  };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white bg-${toast.tipo}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.mensaje}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Mis Servicios" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER CABECERA */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-3 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Seguimiento de mis Servicios</h4>
            <p className="mb-0 opacity-75">Usuario: <strong>{usuario}</strong> — {servicios.length} servicio(s) registrado(s)</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-light fw-bold px-3" onClick={generarPDF} title="Descargar historial en PDF">
              Descargar PDF
            </button>
            <button className="btn btn-light fw-bold text-danger px-4" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              {mostrarFormulario ? "Cancelar Solicitud" : "+ Nuevo Servicio"}
            </button>
          </div>
        </div>

        {/* FORMULARIO SOLICITUD */}
        {mostrarFormulario && (
          <div className="card shadow-sm mb-4 p-4 fade-in-up">
            <h5 className="fw-bold mb-3">Solicitar una Reparación Nueva</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="small fw-bold text-muted mb-1">Marca y Modelo</label>
                <input 
                  className="form-control" 
                  placeholder="Ej: iPhone 13 Pro" 
                  value={formNuevo.Movil_Nombre} 
                  onChange={e => setFormNuevo({...formNuevo, Movil_Nombre: e.target.value})} 
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted mb-1">Detalle Físico Principal</label>
                <input 
                  className="form-control" 
                  placeholder="Ej: Pantalla rota / Batería inflamada" 
                  value={formNuevo.Movil_Especificacion} 
                  onChange={e => setFormNuevo({...formNuevo, Movil_Especificacion: e.target.value})} 
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted mb-1">Cuentanos la Falla Cortamente</label>
                <input 
                  className="form-control" 
                  placeholder="Ej: El teléfono no carga bien desde ayer..." 
                  value={formNuevo.Descripcion} 
                  onChange={e => setFormNuevo({...formNuevo, Descripcion: e.target.value})} 
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="col-12 mt-3 text-end">
                <button className="btn btn-primary fw-bold px-5" onClick={crearServicio}>
                  Crear e Ingresar Solicitud
                </button>
              </div>
            </div>
          </div>
        )}

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--color-primary)' }} role="status" />
            <p className="mt-3 text-muted">Cargando tus servicios...</p>
          </div>
        ) : servicios.length === 0 && !mostrarFormulario ? (
          <div className="text-center py-5">
            <h5 className="text-muted mt-3">No tienes servicios registrados actualmente.</h5>
            <button className="btn btn-primary fw-bold mt-3"
              onClick={() => setMostrarFormulario(true)}>
              ¡Solicita tu primera reparación aquí!
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {servicios.map(s => {
              const info = etapaInfo(s.Etapa);
              const cancelable = Number(s.Etapa) !== 100 && Number(s.Etapa) !== -1;
              return (
                <div key={s.ID_Servicio} className="col-md-6 stagger-item">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                      <span className="fw-bold">Servicio #{s.ID_Servicio}</span>
                      <span className="badge" style={{ backgroundColor: info.color }}>{info.texto}</span>
                    </div>
                    <div className="card-body">
                      <p className="mb-1"><strong>Dispositivo:</strong> {s.Movil_Nombre}</p>
                      <p className="mb-1"><strong>Descripción:</strong> {s.Descripcion}</p>
                      <p className="mb-1"><strong>Especificación:</strong> {s.Movil_Especificacion}</p>
                      <p className="mb-1"><strong>Costo Actual:</strong> ${s.Precio}</p>
                      <p className="mb-3"><strong>Fecha de Entrada:</strong> {s.Fecha ? String(s.Fecha).split('T')[0] : '—'}</p>

                      {Number(s.Etapa) !== -1 && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between small text-muted mb-1">
                            <span className="fw-bold">Progreso Técnico</span>
                            <span className="fw-bold">{info.porcentaje}%</span>
                          </div>
                          <div className="progress" style={{ height: '10px', backgroundColor: 'var(--color-border)' }}>
                            <div className="progress-bar" role="progressbar"
                              style={{ width: `${info.porcentaje}%`, backgroundColor: info.color }}
                              aria-valuenow={info.porcentaje} aria-valuemin="0" aria-valuemax="100" />
                          </div>
                          <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                            <span>Recibido</span>
                            <span>Diagnóstico</span>
                            <span>Reparación</span>
                            <span>Calidad</span>
                            <span>Listo</span>
                          </div>
                        </div>
                      )}

                      <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            localStorage.setItem('chatInfo', JSON.stringify({ ID_Servicio: s.ID_Servicio }));
                            setVista('chatVista');
                          }}>
                            Chat con Asesor
                        </button>
                        {cancelable && (
                          <button className="btn btn-sm btn-outline-danger"
                            onClick={() => cancelarServicio(s.ID_Servicio)}>
                            Cancelar Solicitud
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

export default MiServicio;
