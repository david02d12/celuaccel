import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

/* ── Tipos de acción de la bitácora ─────────────────────────── */
const TIPOS_ACCION = [
  { valor: 'Ingresado',           label: 'Ingresado',              desc: 'Dispositivo recibido en tienda',    color: '#0d6efd', icon: '📥' },
  { valor: 'En diagnóstico',      label: 'En diagnóstico',         desc: 'Revisando el equipo',               color: '#f59e0b', icon: '🔍' },
  { valor: 'En reparación',       label: 'En reparación',          desc: 'Ejecutando la reparación',          color: '#f97316', icon: '🔧' },
  { valor: 'Control de calidad',  label: 'Control de calidad',     desc: 'Verificando resultado',             color: '#8b5cf6', icon: '🔬' },
  { valor: 'Terminado',           label: 'Terminado',              desc: 'Reparación finalizada',             color: '#198754', icon: '✅' },
  { valor: 'Cancelado',           label: 'Cancelado',              desc: 'Servicio cancelado',                color: '#6c757d', icon: '❌' },
];

const tipoInfo = (estado) => TIPOS_ACCION.find(t => t.valor === estado) || TIPOS_ACCION[0];

/* ── Formateo de fecha ─────────────────────────────────────── */
const formatFechaHora = (f) => {
  if (!f) return '—';
  const d = new Date(f);
  if (isNaN(d)) return String(f).split('T')[0];
  return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ── Modal genérico ─────────────────────────────────────────── */
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

/* ── Nodo del timeline ────────────────────────────────────────── */
const NodoTimeline = ({ d, onClick, isLast }) => {
  const tipo = tipoInfo(d.Estado);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
      {/* Línea + nodo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 48 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: tipo.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', boxShadow: `0 0 0 4px ${tipo.color}22`,
          zIndex: 1, flexShrink: 0
        }}>
          {tipo.icon}
        </div>
        {!isLast && (
          <div style={{ width: 2, flex: 1, minHeight: 24, background: 'var(--color-border)', margin: '4px 0' }} />
        )}
      </div>

      {/* Contenido del evento */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1, marginLeft: 12, marginBottom: isLast ? 0 : 20,
          background: hovered ? 'var(--color-surfaceAlt, #2a2a2a)' : 'var(--color-surface, #1e1e1e)',
          border: `1px solid ${hovered ? tipo.color + '66' : 'var(--color-border)'}`,
          borderLeft: `4px solid ${tipo.color}`,
          borderRadius: 10, padding: '12px 14px',
          cursor: 'pointer', transition: 'all 0.2s ease',
          boxShadow: hovered ? `0 4px 16px ${tipo.color}22` : '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            {/* Badge de tipo */}
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 20,
              background: tipo.color + '22', color: tipo.color,
              fontSize: '0.72rem', fontWeight: 700, marginBottom: 6
            }}>
              {tipo.label}
            </span>

            {/* Servicio */}
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text)', marginBottom: 3 }}>
              🔧 Servicio #{d.ID_Servicio}
              {d.Movil_Nombre && (
                <span style={{ fontWeight: 400, fontSize: '0.82rem', color: 'var(--color-text-muted)', marginLeft: 6 }}>
                  — {d.Movil_Nombre}
                </span>
              )}
            </div>

            {/* Descripción */}
            <div style={{
              fontSize: '0.83rem', color: 'var(--color-text)',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }} title={d.Descripcion_Evento}>
              📝 {d.Descripcion_Evento || '—'}
            </div>
          </div>

          {/* Fecha */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              🕒 {formatFechaHora(d.Fecha_Evento)}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#888', marginTop: 4 }}>
              Evento #{d.ID_Registro}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Historial = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [modalForm, setModalForm] = useState(false);
  const [detalleItem, setDetalleItem] = useState(null);
  const [form, setForm] = useState({
    ID_Registro: '', ID_Servicio: '', Descripcion_Evento: '', Estado: 'Ingresado', notaAdicional: ''
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
      // Construir descripción: "Tipo: nota adicional" o solo "Tipo"
      const tipoLabel = TIPOS_ACCION.find(t => t.valor === form.Estado)?.label || form.Estado;
      const nota = form.notaAdicional?.trim();
      const descripcionFinal = nota ? `${tipoLabel}: ${nota}` : tipoLabel;

      const payload = {
        ID_Servicio: form.ID_Servicio,
        Descripcion_Evento: descripcionFinal,
        Estado: form.Estado,
        ...(enEdicion ? { ID_Registro: form.ID_Registro } : {})
      };

      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/historial/${url}`, payload);
      mostrarToast(enEdicion ? 'Evento actualizado.' : 'Evento registrado en la bitácora.');
      listar(); limpiar();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al procesar la solicitud.';
      mostrarToast(msg, false);
    }
  };

  const eliminar = async (id) => {
    if (await confirmar('¿Eliminar este registro de la bitácora?')) {
      try { await api.delete(`/historial/eliminar/${id}`); mostrarToast('Evento eliminado.'); listar(); }
      catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => {
    setForm({ ID_Registro: '', ID_Servicio: '', Descripcion_Evento: '', Estado: 'Ingresado', notaAdicional: '' });
    setEnEdicion(false); setModalForm(false);
  };

  const abrirNuevo = () => { limpiar(); setModalForm(true); };
  const abrirEdicion = (d) => {
    setEnEdicion(true);
    // Separar tipo y nota si la descripción sigue el formato "Tipo: nota"
    const partes = (d.Descripcion_Evento || '').split(': ');
    const estadoDetectado = TIPOS_ACCION.find(t => t.label === partes[0])?.valor || d.Estado;
    const notaDetectada = partes.length > 1 ? partes.slice(1).join(': ') : '';
    setForm({ ...d, Estado: estadoDetectado || d.Estado, notaAdicional: notaDetectada });
    setDetalleItem(null); setModalForm(true);
  };
  const abrirDetalle = (d) => setDetalleItem(d);

  const exportarPDF = () => {
    if (filtrados.length === 0) return mostrarToast('No hay eventos para exportar.', false);
    const doc = new jsPDF();
    const usuario = sessionStorage.getItem('user') || 'Usuario';
    doc.setFillColor(219, 0, 0); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('CELUACCEL', 14, 15);
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('Bitácora de Servicios Técnicos', 14, 23);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 195, 15, { align:'right' });
    doc.text(`Generado por: ${usuario}`, 195, 22, { align:'right' });
    doc.setTextColor(0,0,0);
    autoTable(doc, {
      startY: 38,
      head: [['ID','Servicio','Dispositivo','Tipo de Evento','Descripción','Fecha y Hora']],
      body: filtrados.map(d => [
        d.ID_Registro, `#${d.ID_Servicio}`, d.Movil_Nombre || '—',
        d.Estado || '—', d.Descripcion_Evento || '—',
        formatFechaHora(d.Fecha_Evento)
      ]),
      headStyles:{ fillColor:[219,0,0], textColor:[255,255,255], fontStyle:'bold' },
      alternateRowStyles:{ fillColor:[248,249,250] },
      styles:{ fontSize:7.5, cellPadding:3, overflow:'linebreak' },
      columnStyles:{ 4:{ cellWidth:60 } }
    });
    doc.save(`Bitacora_CeluAccel_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarToast('PDF exportado correctamente.');
  };

  const inputStyle = { backgroundColor:'var(--color-bg)', color:'var(--color-text)', borderColor:'var(--color-border)' };

  const filtrados = datos.filter(d => {
    const matchBusqueda =
      String(d.ID_Registro).includes(busqueda) ||
      String(d.ID_Servicio).includes(busqueda) ||
      String(d.Fecha_Evento||'').includes(busqueda) ||
      String(d.Movil_Nombre||'').toLowerCase().includes(busqueda.toLowerCase()) ||
      String(d.Descripcion_Evento||'').toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos' ? true : String(d.Estado) === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(filtrados, 15);

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
        const tipo = tipoInfo(detalleItem.Estado);
        return (
          <ModalOverlay titulo={`Bitácora — Evento #${detalleItem.ID_Registro}`} onClose={() => setDetalleItem(null)}>
            <div className="text-center mb-4">
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{tipo.icon}</div>
              <span style={{
                display: 'inline-block', padding: '6px 18px', borderRadius: 20,
                background: tipo.color + '22', color: tipo.color,
                fontSize: '0.92rem', fontWeight: 700, border: `1px solid ${tipo.color}44`
              }}>
                {tipo.label}
              </span>
            </div>

            <Fila label="🔧 Servicio">
              <button className="btn btn-link p-0 fw-bold" style={{ color:'var(--color-primary)', fontSize:'0.86rem' }}
                onClick={() => { setDetalleItem(null); sessionStorage.setItem('searchServicio', String(detalleItem.ID_Servicio)); setVista('servicios'); }}>
                #{detalleItem.ID_Servicio}{detalleItem.Movil_Nombre ? ` — ${detalleItem.Movil_Nombre}` : ''} → Ver servicio
              </button>
            </Fila>
            <Fila label="🕒 Fecha y hora">{formatFechaHora(detalleItem.Fecha_Evento)}</Fila>
            <Fila label="📝 Descripción"><em>{detalleItem.Descripcion_Evento || '—'}</em></Fila>
            {detalleItem.Movil_Especificacion && <Fila label="📱 Especificación">{detalleItem.Movil_Especificacion}</Fila>}

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
        <ModalOverlay titulo={enEdicion ? 'Editar Evento' : 'Registrar en Bitácora'} onClose={limpiar}>
          {enEdicion && (
            <div className="mb-3 p-2 rounded" style={{ background: 'var(--color-surfaceAlt)', fontSize: '0.83rem', color: 'var(--color-text-muted)' }}>
              ✏️ Editando Evento #{form.ID_Registro}
            </div>
          )}

          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Servicio asociado (ID)</label>
            <input className="form-control" style={inputStyle} type="number" value={form.ID_Servicio}
              placeholder="Número del servicio (ej: 300003)"
              onChange={e => setForm({...form, ID_Servicio: e.target.value})} />
          </div>

          <div className="mb-3">
            <label className="small text-muted fw-bold mb-2">Tipo de acción</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {TIPOS_ACCION.map(t => (
                <button
                  key={t.valor}
                  type="button"
                  onClick={() => setForm({...form, Estado: t.valor})}
                  style={{
                    padding: '10px 12px', borderRadius: 8, border: `2px solid ${form.Estado === t.valor ? t.color : 'var(--color-border)'}`,
                    background: form.Estado === t.valor ? t.color + '22' : 'var(--color-bg)',
                    color: form.Estado === t.valor ? t.color : 'var(--color-text)',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: form.Estado === t.valor ? 700 : 400,
                    textAlign: 'left', transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.label}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="small text-muted fw-bold mb-1">Nota adicional (opcional)</label>
            <textarea className="form-control" style={inputStyle} rows={3} value={form.notaAdicional}
              placeholder={`Detalles específicos... (ej: Pantalla reemplazada y probada OK)`}
              onChange={e => setForm({...form, notaAdicional: e.target.value})} />
            {form.notaAdicional && (
              <div className="mt-1 small" style={{ color: 'var(--color-text-muted)' }}>
                📋 Descripción final: <em>"{TIPOS_ACCION.find(t=>t.valor===form.Estado)?.label || form.Estado}: {form.notaAdicional}"</em>
              </div>
            )}
          </div>

          {/* Fecha: info de que se auto-asigna */}
          <div className="mb-3 p-2 rounded d-flex align-items-center gap-2"
            style={{ background: 'var(--color-surfaceAlt)', border: '1px solid var(--color-border)', fontSize: '0.83rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🕒</span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              La fecha y hora se registran <strong>automáticamente</strong> al guardar.
            </span>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" style={{ flex:1 }} onClick={limpiar}>Cerrar</button>
            <button className="btn fw-bold" style={{ flex:1, background:'var(--color-primary)', color:'#fff', border:'none' }} onClick={guardar}>
              {enEdicion ? 'Actualizar' : '📋 Registrar'}
            </button>
          </div>
        </ModalOverlay>
      )}

      <Navbar titulo="CELUACCEL — Bitácora de Servicios" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">📋 Bitácora de Servicios</h4>
            <p className="mb-0 opacity-75">Registro cronológico de cada paso técnico — más reciente primero</p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="badge text-danger fw-bold" style={{ backgroundColor:'#fff' }}>{datos.length} eventos</span>
            <button className="btn btn-sm btn-outline-light fw-bold px-3" onClick={exportarPDF}>Exportar PDF</button>
            <button className="btn btn-sm fw-bold" style={{ background:'#fff', color:'var(--color-primary)', borderRadius:'8px', padding:'6px 14px' }} onClick={abrirNuevo}>
              + Nuevo evento
            </button>
          </div>
        </div>

        {/* BUSCADOR + FILTRO POR TIPO */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          <input type="text" className="form-control flex-grow-1" style={inputStyle}
            placeholder="Buscar por ID, servicio, dispositivo o descripción..."
            value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
          <select className="form-select" style={{ ...inputStyle, width:'auto', minWidth: 180 }}
            value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}>
            <option value="todos">Todos los tipos</option>
            {TIPOS_ACCION.map(t => <option key={t.valor} value={t.valor}>{t.icon} {t.label}</option>)}
          </select>
        </div>

        {/* LEYENDA DE TIPOS */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {TIPOS_ACCION.map(t => (
            <span key={t.valor}
              onClick={() => setFiltroEstado(prev => prev === t.valor ? 'todos' : t.valor)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 20,
                background: filtroEstado === t.valor ? t.color + '33' : 'var(--color-surface)',
                border: `1px solid ${filtroEstado === t.valor ? t.color : 'var(--color-border)'}`,
                color: filtroEstado === t.valor ? t.color : 'var(--color-text-muted)',
                fontSize: '0.75rem', fontWeight: filtroEstado === t.valor ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
              {t.icon} {t.label}
              {filtroEstado === t.valor && <span style={{ marginLeft: 4 }}>✕</span>}
            </span>
          ))}
        </div>

        {/* TIMELINE */}
        {filtrados.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
            <p className="text-muted fw-semibold">No se encontraron eventos con ese criterio.</p>
          </div>
        ) : (
          <>
            <div style={{ paddingLeft: 4 }}>
              {datosPagina.map((d, idx) => (
                <NodoTimeline
                  key={d.ID_Registro}
                  d={d}
                  onClick={() => abrirDetalle(d)}
                  isLast={idx === datosPagina.length - 1}
                />
              ))}
            </div>
            {totalPaginas > 1 && (
              <div className="mt-4">
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