import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Historial = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    ID_Historial: '', ID_Servicio: '', Fecha_Evento: '', Descripcion_Evento: '', Estado: '1'
  });

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
      const res = await axios.get('http://localhost:3000/api/historial/listar', config());
      setDatos(res.data);
    } catch (err) { mostrarToast('Error al cargar el historial.', false); }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? "actualizar" : "agregar";
      const metodo = enEdicion ? 'put' : 'post';
      await axios[metodo](`http://localhost:3000/api/historial/${url}`, form, config());
      mostrarToast(enEdicion ? 'Evento actualizado correctamente.' : 'Evento registrado en el historial.');
      listar();
      limpiar();
    } catch (err) { mostrarToast("Error al procesar la solicitud.", false); }
  };

  const eliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await axios.delete(`http://localhost:3000/api/historial/eliminar/${id}`, config());
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

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Historial de Servicios" cerrarSesion={cerrarSesion}>
        <button className="btn btn-sm fw-bold text-white" style={{ backgroundColor: '#198754' }} onClick={exportarPDF}>
          Exportar PDF
        </button>
      </Navbar>

      <div className="container mt-4">
        <div className="mb-4 p-4 rounded-3 text-white d-flex justify-content-between align-items-center flex-wrap gap-2"
          style={{ background: 'linear-gradient(135deg, #DB0000, #8B0000)' }}>
          <div>
            <h4 className="fw-bold mb-1">Historial de Eventos</h4>
            <p className="mb-0 opacity-75">Registro cronológico de cada paso técnico en los servicios</p>
          </div>
          <span className="badge bg-light text-danger fw-bold fs-6">{datos.length} eventos</span>
        </div>

        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="mb-3 fw-bold">{enEdicion ? "Editar Evento" : "Nuevo Evento"}</h5>
              <input className="form-control mb-2" disabled={enEdicion} value={form.ID_Historial} placeholder="ID Historial" onChange={e => setForm({...form, ID_Historial: e.target.value})} />
              <input className="form-control mb-2" type="number" value={form.ID_Servicio} placeholder="ID del Servicio asociado" onChange={e => setForm({...form, ID_Servicio: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Fecha del evento</label>
              <input className="form-control mb-2" type="date" value={form.Fecha_Evento} onChange={e => setForm({...form, Fecha_Evento: e.target.value})} />
              <input className="form-control mb-2" value={form.Descripcion_Evento} placeholder="Descripción del evento técnico" onChange={e => setForm({...form, Descripcion_Evento: e.target.value})} />
              <label className="small text-muted fw-bold mb-1">Estado del evento</label>
              <select className="form-select mb-3" value={form.Estado} onChange={e => setForm({...form, Estado: e.target.value})}>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
              <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={guardar}>
                {enEdicion ? "Actualizar Evento" : "Guardar Evento"}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow-sm overflow-hidden">
              <div className="p-3 border-bottom">
                <input type="text" className="form-control"
                  placeholder="Buscar por ID, servicio, estado o descripción..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr><th>ID Historial</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody className="bg-white">
                  {datos.filter(d =>
                    String(d.ID_Historial).includes(busqueda) ||
                    String(d.ID_Servicio).includes(busqueda) ||
                    String(d.Estado || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(d.Descripcion_Evento || '').toLowerCase().includes(busqueda.toLowerCase())
                  ).map(d => (
                    <tr key={d.ID_Historial}>
                      <td className="fw-bold">{d.ID_Historial}</td>
                      <td>{d.ID_Servicio}</td>
                      <td>{d.Fecha_Evento ? d.Fecha_Evento.split('T')[0] : ''}</td>
                      <td>
                        <span className={`badge ${d.Estado === '1' || d.Estado === 1 ? 'bg-success' : 'bg-secondary'}`}>
                          {d.Estado === '1' || d.Estado === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm me-1 text-white fw-bold" style={{ backgroundColor: '#121212' }}
                          onClick={() => { setEnEdicion(true); setForm({...d, Fecha_Evento: d.Fecha_Evento ? d.Fecha_Evento.split('T')[0] : '', Estado: String(d.Estado)}); }}>
                          Editar
                        </button>
                        <button className="btn btn-sm text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={() => eliminar(d.ID_Historial)}>Borrar</button>
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
    </div>
  );
};

export default Historial;