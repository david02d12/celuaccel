import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Historial = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
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
    } catch (err) { mostrarToast('Error al cargar el historial.', false); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? "actualizar" : "agregar";
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/historial/${url}`, form);
      mostrarToast(enEdicion ? 'Evento actualizado correctamente.' : 'Evento registrado en el historial.');
      listar();
      limpiar();
    } catch (err) { mostrarToast("Error al procesar la solicitud.", false); }
  };

  const eliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await api.delete(`/historial/eliminar/${id}`);
        mostrarToast('Evento eliminado del historial.');
        listar();
      } catch (err) { mostrarToast('Error al eliminar el registro.', false); }
    }
  };

  const limpiar = () => {
    setForm({ ID_Historial: '', ID_Servicio: '', Fecha_Evento: '', Descripcion_Evento: '', Estado: '1' });
    setEnEdicion(false);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(219, 0, 0);
    doc.text('CELUACCEL', 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text('Historial de Servicios', 14, 26);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 32);

    const filas = datos.map(d => [
      d.ID_Historial,
      d.ID_Servicio,
      d.Fecha_Evento ? String(d.Fecha_Evento).split('T')[0] : '',
      d.Descripcion_Evento,
      d.Estado === '1' || d.Estado === 1 ? 'Activo' : 'Inactivo'
    ]);

    autoTable(doc, {
      startY: 38,
      head: [['ID Historial', 'ID Servicio', 'Fecha Evento', 'Descripción', 'Estado']],
      body: filas,
      headStyles: { fillColor: [219, 0, 0] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      styles: { fontSize: 9 }
    });

    doc.save(`historial_celuaccel_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)'
  };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Historial de Eventos" cerrarSesion={cerrarSesion}>
        <button className="btn btn-sm btn-success px-3" onClick={exportarPDF}>
          Exportar PDF
        </button>
      </Navbar>

      <div className="container mt-4">
        {/* BANNER ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Historial de Eventos</h4>
            <p className="mb-0 opacity-75">Registro cronológico de cada paso técnico en los servicios</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{datos.length} eventos</span>
        </div>

        <div className="row">
          {/* PANEL IZQUIERDO: FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="mb-3 fw-bold">{enEdicion ? "Editar Evento" : "Nuevo Evento"}</h5>
              <input className="form-control mb-2" style={inputStyle} disabled={enEdicion} value={form.ID_Historial} placeholder="ID Historial" onChange={e => setForm({...form, ID_Historial: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} type="number" value={form.ID_Servicio} placeholder="ID del Servicio asociado" onChange={e => setForm({...form, ID_Servicio: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Fecha del evento</label>
              <input className="form-control mb-2" style={inputStyle} type="date" value={form.Fecha_Evento} onChange={e => setForm({...form, Fecha_Evento: e.target.value})} />
              <input className="form-control mb-2" style={inputStyle} value={form.Descripcion_Evento} placeholder="Descripción del evento técnico" onChange={e => setForm({...form, Descripcion_Evento: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Estado del evento</label>
              <select className="form-select mb-3" style={inputStyle} value={form.Estado} onChange={e => setForm({...form, Estado: e.target.value})}>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
              <button className="btn w-100 btn-primary" onClick={guardar}>
                {enEdicion ? "Actualizar Evento" : "Guardar Evento"}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          {/* PANEL DERECHO: TABLA */}
          <div className="col-lg-8 col-12">
            <div className="card shadow-sm overflow-hidden">
              <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Buscar por ID, servicio, estado o descripción..."
                  value={busqueda} 
                  onChange={e => setBusqueda(e.target.value)} 
                  style={inputStyle}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID Historial</th>
                      <th>Servicio</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.filter(d =>
                      String(d.ID_Historial).includes(busqueda) ||
                      String(d.ID_Servicio).includes(busqueda) ||
                      String(d.Estado || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                      String(d.Descripcion_Evento || '').toLowerCase().includes(busqueda.toLowerCase())
                    ).map(d => (
                      <tr key={d.ID_Historial} className="stagger-item">
                        <td className="fw-bold">{d.ID_Historial}</td>
                        <td>{d.ID_Servicio}</td>
                        <td>{d.Fecha_Evento ? d.Fecha_Evento.split('T')[0] : ''}</td>
                        <td>
                          <span className={`badge ${d.Estado === '1' || d.Estado === 1 ? 'bg-success' : 'bg-secondary'}`}>
                            {d.Estado === '1' || d.Estado === 1 ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => { setEnEdicion(true); setForm({...d, Fecha_Evento: d.Fecha_Evento ? d.Fecha_Evento.split('T')[0] : '', Estado: String(d.Estado)}); }}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(d.ID_Historial)}>Borrar</button>
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

export default Historial;