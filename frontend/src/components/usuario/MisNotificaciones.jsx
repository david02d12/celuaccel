import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const MisNotificaciones = ({ cerrarSesion, setVista }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const usuario = localStorage.getItem('user') || '';

  const config = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await axios.get('http://localhost:3000/api/notificaciones/mis-notificaciones', config());
      setNotificaciones(res.data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setCargando(false);
    }
  };

  const marcarLeida = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/notificaciones/marcar-leida/${id}`, {}, config());
      cargar();
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  const sinLeer = notificaciones.filter(n => !n.parsed?.leida).length;

  const iconoTipo = (texto = '') => {
    const t = texto.toLowerCase();
    if (t.includes('listo') || t.includes('retirar')) return { icon: '✓', color: '#198754' };
    if (t.includes('cancel')) return { icon: '✕', color: '#dc3545' };
    if (t.includes('diagnos')) return { icon: '🔍', color: '#0dcaf0' };
    if (t.includes('reparac')) return { icon: '🔧', color: '#ffc107' };
    return { icon: '!', color: '#DB0000' };
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Mis Notificaciones" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* ENCABEZADO */}
        <div className="mb-4 p-4 rounded-3 text-white d-flex justify-content-between align-items-center flex-wrap gap-2"
          style={{ background: 'linear-gradient(135deg, #DB0000, #8B0000)' }}>
          <div>
            <h4 className="fw-bold mb-1">Centro de Notificaciones</h4>
            <p className="mb-0 opacity-75">Mensajes de tu asesor técnico sobre el estado de tus servicios</p>
          </div>
          {sinLeer > 0 && (
            <span className="badge bg-light text-danger fw-bold fs-6">{sinLeer} sin leer</span>
          )}
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#DB0000' }} />
            <p className="text-muted mt-3">Cargando notificaciones...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center">
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>🔔</div>
            <h5 className="mt-3 text-muted fw-bold">Todo tranquilo por aquí</h5>
            <p className="text-muted small">Tu asesor técnico no ha enviado notificaciones aún. Cuando actualice el estado de tu servicio, aparecerá aquí.</p>
            <button className="btn text-white fw-bold mx-auto mt-2" style={{ backgroundColor: '#DB0000', maxWidth: '200px' }}
              onClick={() => setVista('miServicio')}>
              Ver Mis Servicios
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notificaciones.map(n => {
              const p = n.parsed || {};
              const leida = p.leida === true;
              const icono = iconoTipo(p.texto || '');
              return (
                <div key={n.Codigo_Notificaciones}
                  className={`card shadow-sm p-4 border-start border-4 ${leida ? 'opacity-75' : ''}`}
                  style={{ borderColor: leida ? '#dee2e6' : icono.color + ' !important', borderLeftColor: leida ? '#dee2e6' : icono.color }}>
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    {/* Icono */}
                    <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                      style={{ width: '46px', height: '46px', backgroundColor: leida ? '#6c757d' : icono.color, fontSize: '1.1rem' }}>
                      {icono.icon}
                    </div>

                    {/* Contenido */}
                    <div className="flex-grow-1">
                      <div className="fw-bold mb-1" style={{ color: leida ? '#6c757d' : '#121212' }}>
                        {p.texto || n.Tipo_Notificacion}
                      </div>
                      <div className="d-flex gap-3 flex-wrap">
                        {p.servicio && (
                          <span className="small text-muted">Servicio #{p.servicio}</span>
                        )}
                        {p.fecha && (
                          <span className="small text-muted">{p.fecha}</span>
                        )}
                        {leida ? (
                          <span className="badge bg-secondary small">Leída</span>
                        ) : (
                          <span className="badge small text-white" style={{ backgroundColor: '#DB0000' }}>Nueva</span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="d-flex gap-2 flex-shrink-0">
                      {p.servicio && (
                        <button className="btn btn-sm fw-bold text-white"
                          style={{ backgroundColor: '#121212' }}
                          onClick={() => setVista('miServicio')}>
                          Ver Servicio
                        </button>
                      )}
                      {!leida && (
                        <button className="btn btn-sm fw-bold text-white"
                          style={{ backgroundColor: '#198754' }}
                          onClick={() => marcarLeida(n.Codigo_Notificaciones)}>
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

export default MisNotificaciones;
