import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getLimitesGeneralesFecha } from '../../utils/validaciones';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

/* ── Modal genérico ──────────────────────────────────────────── */
const ModalOverlay = ({ titulo, onClose, children }) => (
  <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
    <div style={{ background:'var(--color-surface,#1e1e1e)',borderRadius:12,width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
      <div style={{ background:'var(--color-primary,#DB0000)',borderRadius:'12px 12px 0 0',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ color:'#fff',fontWeight:700,fontSize:'1.05rem' }}>{titulo}</span>
        <button onClick={onClose} style={{ background:'transparent',border:'none',color:'#fff',fontSize:'1.3rem',lineHeight:1,cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ padding:'20px' }}>{children}</div>
    </div>
  </div>
);

const Fila = ({ label, children }) => (
  <div style={{ display:'flex',gap:12,padding:'9px 0',borderBottom:'1px solid var(--color-border,#333)',alignItems:'flex-start' }}>
    <span style={{ minWidth:145,fontWeight:700,fontSize:'0.86rem',color:'var(--color-text)',flexShrink:0 }}>{label}</span>
    <span style={{ color:'var(--color-text)',fontSize:'0.86rem',flex:1 }}>{children}</span>
  </div>
);

const Historial = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const { minDate, maxDate } = getLimitesGeneralesFecha();
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalForm, setModalForm] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const [form, setForm] = useState({
    ID_Registro: '', ID_Servicio: '', Fecha_Evento: '', Descripcion_Evento: '', Estado: 'Ingresado'
  });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try { const res = await api.get('/historial/listar'); setDatos(res.data); }
    catch { mostrarToast('Error al cargar el historial.', false); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/historial/${url}`, form);
      mostrarToast(enEdicion ? 'Evento actualizado.' : 'Evento registrado en el historial.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar la solicitud.', false); }
  };

  const eliminar = async (id) => {
    if (await confirmar('¿Eliminar este registro del historial?')) {
      try { await api.delete(`/historial/eliminar/${id}`); mostrarToast('Evento eliminado.'); listar(); }
      catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => {
    setForm({ ID_Registro: '', ID_Servicio: '', Fecha_Evento: '', Descripcion_Evento: '', Estado: 'Ingresado' });
    setEnEdicion(false); setModalForm(false);
  };

  const abrirNuevo = () => { limpiar(); setModalForm(true); };
  const abrirEdicion = (d) => {
    setEnEdicion(true);
    setForm({ ...d, Fecha_Evento: d.Fecha_Evento ? String(d.Fecha_Evento).split('T')[0] : '', Estado: String(d.Estado) });
    setDetalleItem(null); setModalForm(true);
  };
  const abrirDetalle = (d) => setDetalleItem(d);

  const exportarPDF = () => {
    if (filtrados.length === 0) return mostrarToast('No hay eventos para exportar.', false);
    const doc = new jsPDF();
    const usuario = sessionStorage.getItem('user') || 'Usuario';
    const userRole = sessionStorage.getItem('role') || 'N/A';
    doc.setFillColor(219, 0, 0); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('CELUACCEL', 14, 15);
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('Reporte de Auditoría y Trazabilidad', 14, 23);
    doc.setFontSize(9);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 195, 15, { align:'right' });
    doc.text(`Generado por: ${usuario} (Rol: ${userRole})`, 195, 22, { align:'right' });
    doc.setTextColor(0,0,0); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text('Resumen de la vista actual:', 14, 42);
    doc.setFont('helvetica','normal');
    doc.text(`Total de eventos registrados: ${filtrados.length}`, 14, 48);
    autoTable(doc, {
      startY: 55,
      head: [['ID Registro','ID Servicio','Fecha del Evento','Descripción de la Acción','Estado']],
      body: filtrados.map(d => [
        d.ID_Registro, d.ID_Servicio,
        d.Fecha_Evento ? String(d.Fecha_Evento).replace('T',' ').substring(0,19) : '',
        d.Descripcion_Evento,
        d.Estado || '—'
      ]),
      headStyles:{ fillColor:[219,0,0], textColor:[255,255,255], fontStyle:'bold' },
      alternateRowStyles:{ fillColor:[248,249,250] },
      styles:{ fontSize:8, cellPadding:4, overflow:'linebreak' },
      columnStyles:{ 3:{ cellWidth:70 } }
    });
    doc.save(`auditoria_celuaccel_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarToast('PDF exportado correctamente.');
  };

  const inputStyle = { backgroundColor:'var(--color-bg)', color:'var(--color-text)', borderColor:'var(--color-border)' };

  const filtrados = datos.filter(d => {
    const matchBusqueda =
      String(d.ID_Registro).includes(busqueda) ||
      String(d.ID_Servicio).includes(busqueda) ||
      String(d.Fecha_Evento||'').includes(busqueda) ||
      String(d.Descripcion_Evento||'').toLowerCase().includes(busqueda.toLowerCase());
    
    const est = String(d.Estado || '').toLowerCase();
    const matchEstado = filtroEstado === 'todos' ? true
      : filtroEstado === 'activo' ? (est !== 'cancelado')
      : (est === 'cancelado');
    return matchBusqueda && matchEstado;
  });

  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(filtrados, 12);
  const totalActivos = datos.filter(d => String(d.Estado).toLowerCase() !== 'cancelado').length;

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      {/* ── MODAL DETALLE ── */}
      {detalleItem && (() => {
        const activo = String(detalleItem.Estado).toLowerCase() !== 'cancelado';
        return (
          <ModalOverlay titulo={`Evento #${detalleItem.ID_Registro}`} onClose={() => setDetalleItem(null)}>
            {/* Estado prominente */}
            <div className="text-center mb-4">
              <span className={`badge px-4 py-2 fs-6 fw-bold ${activo ? 'bg-success' : 'bg-secondary'}`}>
                {detalleItem.Estado || (activo ? 'Activo' : 'Cancelado')}
              </span>
            </div>
            <Fila label="ID Registro">{detalleItem.ID_Registro}</Fila>
            <Fila label="ID Servicio">
              <button className="btn btn-link p-0 fw-bold" style={{ color:'var(--color-primary)', fontSize:'0.86rem' }}
                onClick={() => { setDetalleItem(null); sessionStorage.setItem('searchServicio', String(detalleItem.ID_Servicio)); setVista('servicios'); }}>
                #{detalleItem.ID_Servicio} — Ver servicio →
              </button>
            </Fila>
            <Fila label="Fecha del Evento">
              <span className="d-flex align-items-center gap-1">
                <IconCalendar />{detalleItem.Fecha_Evento ? String(detalleItem.Fecha_Evento).split('T')[0] : '—'}
              </span>
            </Fila>
            <Fila label="Descripción">
              <span className="d-flex align-items-start gap-1">
                <IconClipboard /><em>{detalleItem.Descripcion_Evento || '—'}</em>
              </span>
            </Fila>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetalleItem(null)}>Cerrar</button>
              <button className="btn btn-outline-secondary" style={{ flex:1 }} onClick={() => abrirEdicion(detalleItem)}>✏️ Editar</button>
              <button className="btn" style={{ flex:1, background:'#dc3545', color:'#fff', border:'none' }}
                onClick={async () => { setDetalleItem(null); await eliminar(detalleItem.ID_Registro); }}>🗑 Eliminar</button>
            </div>
          </ModalOverlay>
        );
      })()}

      {/* ── MODAL FORMULARIO ── */}
      {modalForm && (
        <ModalOverlay titulo={enEdicion ? 'Editar Evento' : 'Nuevo Evento'} onClose={limpiar}>
          {enEdicion && (
            <div className="mb-2">
              <label className="small text-muted fw-bold mb-1">ID Registro</label>
              <input className="form-control" style={{ ...inputStyle, opacity:0.7 }} disabled value={form.ID_Registro} />
            </div>
          )}
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">ID del Servicio asociado</label>
            <input className="form-control" style={inputStyle} type="number" value={form.ID_Servicio}
              placeholder="ID del Servicio" onChange={e => setForm({...form, ID_Servicio: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Fecha del Evento</label>
            <input className="form-control" style={inputStyle} type="date" value={form.Fecha_Evento}
              min={minDate} max={maxDate} onChange={e => setForm({...form, Fecha_Evento: e.target.value})} />
          </div>
          <div className="mb-2">
            <label className="small text-muted fw-bold mb-1">Descripción del Evento</label>
            <textarea className="form-control" style={inputStyle} rows={3} value={form.Descripcion_Evento}
              placeholder="Descripcion del evento tecnico" onChange={e => setForm({...form, Descripcion_Evento: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Estado</label>
            <select className="form-select" style={inputStyle} value={form.Estado}
              onChange={e => setForm({...form, Estado: e.target.value})}>
              <option value="Ingresado">Ingresado</option>
              <option value="En proceso">En proceso</option>
              <option value="Terminado">Terminado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-secondary" style={{ flex:1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn fw-bold" style={{ flex:1, background:'var(--color-primary)', color:'#fff', border:'none' }} onClick={guardar}>
              {enEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </ModalOverlay>
      )}

      <Navbar titulo="CELUACCEL — Historial de Eventos" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Historial de Eventos</h4>
            <p className="mb-0 opacity-75">Registro cronológico de cada paso técnico en los servicios</p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="badge text-danger fw-bold" style={{ backgroundColor:'#fff' }}>{datos.length} eventos</span>
            <span className="badge fw-bold" style={{ backgroundColor:'rgba(255,255,255,0.2)' }}>{totalActivos} activos</span>
            <button className="btn btn-sm btn-outline-light fw-bold px-3" onClick={exportarPDF}>Exportar PDF</button>
            <button className="btn btn-sm fw-bold" style={{ background:'#fff', color:'var(--color-primary)', borderRadius:'8px', padding:'6px 14px' }} onClick={abrirNuevo}>
              + Nuevo evento
            </button>
          </div>
        </div>

        {/* BUSCADOR + FILTRO */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <input type="text" className="form-control flex-grow-1" style={inputStyle}
            placeholder="Buscar por ID, servicio, descripción o fecha..."
            value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
          <select className="form-select" style={{ ...inputStyle, width:'auto' }}
            value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}>
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        {/* GRID DE EVENTOS */}
        {filtrados.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted fw-semibold mt-3">No se encontraron eventos con ese criterio.</p>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'0.85rem' }}>
              {datosPagina.map(d => {
                const activo = String(d.Estado).toLowerCase() !== 'cancelado';
                return (
                  <div key={d.ID_Registro} className="card border-0 shadow-sm fade-in"
                    style={{ borderLeft:`4px solid ${activo ? '#198754' : '#6c757d'}`, borderRadius:12, overflow:'hidden' }}>
                    <div className="card-body p-3">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className="fw-bold" style={{ fontSize:'0.9rem' }}>Evento #{d.ID_Registro}</span>
                          <span className="text-muted ms-2" style={{ fontSize:'0.78rem' }}>Serv. #{d.ID_Servicio}</span>
                        </div>
                        <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize:'0.7rem' }}>
                          {d.Estado || (activo ? 'Activo' : 'Cancelado')}
                        </span>
                      </div>

                      {/* Fecha + descripción resumida */}
                      <div className="d-flex align-items-center gap-1 text-muted mb-1" style={{ fontSize:'0.8rem' }}>
                        <IconCalendar />
                        <span>{d.Fecha_Evento ? String(d.Fecha_Evento).split('T')[0] : '—'}</span>
                      </div>
                      <div className="d-flex align-items-start gap-1 mb-3" style={{ fontSize:'0.83rem' }}>
                        <IconClipboard />
                        <span style={{ overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }} title={d.Descripcion_Evento}>
                          {d.Descripcion_Evento || '—'}
                        </span>
                      </div>

                      {/* Botón Ver más */}
                      <button className="btn btn-sm fw-bold w-100" style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.8rem' }}
                        onClick={() => abrirDetalle(d)}>Ver más</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPaginas > 1 && (
              <div className="mt-3">
                <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Menu de Navegacion</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <Sidebar setVista={setVista} />
      </div>
    </div>
  );
};

export default Historial;