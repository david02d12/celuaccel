import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const Historial = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    ID_Historial: '', ID_Servicio: '', Fecha_Evento: '', Descripcion_Evento: '', Estado: '1'
  });

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/historial/listar');
      setDatos(res.data);
    } catch { mostrarToast('Error al cargar el historial.', false); }
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
    if (window.confirm('¿Eliminar este registro del historial?')) {
      try {
        await api.delete(`/historial/eliminar/${id}`);
        mostrarToast('Evento eliminado.'); listar();
      } catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => {
    setForm({ ID_Historial: '', ID_Servicio: '', Fecha_Evento: '', Descripcion_Evento: '', Estado: '1' });
    setEnEdicion(false);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(219, 0, 0);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CELUACCEL — Historial de Eventos', 14, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 22);
    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Servicio', 'Fecha', 'Descripcion', 'Estado']],
      body: datos.map(d => [
        d.ID_Historial, d.ID_Servicio,
        d.Fecha_Evento ? String(d.Fecha_Evento).split('T')[0] : '',
        d.Descripcion_Evento,
        d.Estado === '1' || d.Estado === 1 ? 'Activo' : 'Inactivo'
      ]),
      headStyles: { fillColor: [219, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      styles: { fontSize: 9, cellPadding: 3 }
    });
    doc.save(`historial_celuaccel_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarToast('PDF exportado correctamente.');
  };

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  const filtrados = datos.filter(d => {
    const matchBusqueda =
      String(d.ID_Historial).includes(busqueda) ||
      String(d.ID_Servicio).includes(busqueda) ||
      String(d.Descripcion_Evento || '').toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos'
      ? true
      : filtroEstado === 'activo'
        ? d.Estado === '1' || d.Estado === 1
        : d.Estado === '0' || d.Estado === 0;
    return matchBusqueda && matchEstado;
  });

  const totalActivos = datos.filter(d => d.Estado === '1' || d.Estado === 1).length;

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Historial de Eventos" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BANNER */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Historial de Eventos</h4>
            <p className="mb-0 opacity-75">Registro cronologico de cada paso tecnico en los servicios</p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="badge bg-white text-danger fw-bold">{datos.length} eventos</span>
            <span className="badge fw-bold" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {totalActivos} activos
            </span>
            <button className="btn btn-sm btn-outline-light fw-bold px-3" onClick={exportarPDF}>
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ width: 4, height: 20, background: 'var(--color-primary)', borderRadius: 2, display: 'inline-block' }}/>
                <h5 className="mb-0 fw-bold">{enEdicion ? 'Editar Evento' : 'Nuevo Evento'}</h5>
              </div>
              {enEdicion && (
                <input className="form-control mb-2" style={inputStyle} disabled value={form.ID_Historial} placeholder="ID Historial (auto)" />
              )}
              <input className="form-control mb-2" style={inputStyle} type="number" value={form.ID_Servicio}
                placeholder="ID del Servicio asociado" onChange={e => setForm({...form, ID_Servicio: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Fecha del evento</label>
              <input className="form-control mb-2" style={inputStyle} type="date" value={form.Fecha_Evento}
                onChange={e => setForm({...form, Fecha_Evento: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} value={form.Descripcion_Evento}
                placeholder="Descripcion del evento tecnico" onChange={e => setForm({...form, Descripcion_Evento: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Estado</label>
              <select className="form-select mb-3" style={inputStyle} value={form.Estado}
                onChange={e => setForm({...form, Estado: e.target.value})}>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
              <button className="btn w-100 btn-primary fw-bold" onClick={guardar}>
                {enEdicion ? 'Actualizar Evento' : 'Guardar Evento'}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          {/* CARDS DE EVENTOS */}
          <div className="col-lg-8 col-12">
            {/* Buscador + filtros */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              <input type="text" className="form-control flex-grow-1" style={inputStyle}
                placeholder="Buscar por ID, servicio o descripcion..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              <select className="form-select" style={{ ...inputStyle, width: 'auto' }}
                value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            {filtrados.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted fw-semibold mt-3">No se encontraron eventos con ese criterio.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filtrados.map(d => {
                  const activo = d.Estado === '1' || d.Estado === 1;
                  return (
                    <div key={d.ID_Historial} className="card border-0 shadow-sm fade-in"
                      style={{
                        borderLeft: `4px solid ${activo ? '#198754' : '#6c757d'}`,
                        borderRadius: 12, overflow: 'hidden'
                      }}>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold" style={{ fontSize: '0.9rem' }}>
                              Evento #{d.ID_Historial}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                              Servicio #{d.ID_Servicio}
                            </span>
                          </div>
                          <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'}`}
                            style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            {activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>

                        <div className="d-flex align-items-start gap-3 mb-3" style={{ fontSize: '0.85rem' }}>
                          <div className="d-flex align-items-center gap-1 text-muted">
                            <IconCalendar />
                            <span>{d.Fecha_Evento ? String(d.Fecha_Evento).split('T')[0] : '—'}</span>
                          </div>
                          <div className="d-flex align-items-start gap-1 flex-grow-1">
                            <IconClipboard />
                            <span>{d.Descripcion_Evento || '—'}</span>
                          </div>
                        </div>

                        <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '0.77rem' }}
                            onClick={() => {
                              setEnEdicion(true);
                              setForm({...d, Fecha_Evento: d.Fecha_Evento ? String(d.Fecha_Evento).split('T')[0] : '', Estado: String(d.Estado)});
                            }}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-outline-danger"
                            style={{ fontSize: '0.77rem' }}
                            onClick={() => eliminar(d.ID_Historial)}>
                            Eliminar
                          </button>
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
    </div>
  );
};

export default Historial;