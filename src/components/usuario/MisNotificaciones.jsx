import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const MisNotificaciones = ({ cerrarSesion, setVista }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await api.get('/notificaciones/mis-notificaciones');
      setNotificaciones(res.data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setCargando(false);
    }
  };

  const marcarLeida = async (id) => {
    try {
      await api.patch(`/notificaciones/marcar-leida/${id}`, {});
      cargar();
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.patch('/notificaciones/marcar-todas-leidas', {});
      cargar();
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  // Con la nueva BD, los campos llegan directamente del backend (sin parseo JSON)
  const sinLeer = notificaciones.filter(n => !n.leida).length;

  const iconoTipo = (texto = '') => {
    const t = texto.toLowerCase();
    if (t.includes('listo') || t.includes('retirar')) {
      return { 
        color: '#198754',
        svg: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )
      };
    }
    if (t.includes('cancel')) {
      return { 
        color: '#dc3545',
        svg: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        )
      };
    }
    if (t.includes('diagnos')) {
      return { 
        color: '#0dcaf0',
        svg: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        )
      };
    }
    if (t.includes('reparac')) {
      return { 
        color: '#ffc107',
        svg: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        )
      };
    }
    return { 
      color: 'var(--color-primary)',
      svg: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )
    };
  };

  return (
    <div>
      <Navbar titulo="CELUACCEL — Mis Notificaciones" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* ENCABEZADO */}
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Centro de Notificaciones</h4>
            <p className="mb-0 opacity-75">Mensajes de tu asesor técnico sobre el estado de tus servicios</p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {sinLeer > 0 && (
              <>
                <span className="badge bg-white text-danger fw-bold fs-6">{sinLeer} sin leer</span>
                <button className="btn btn-sm btn-outline-light fw-bold"
                  onClick={marcarTodasLeidas}>
                  Marcar todas leídas
                </button>
              </>
            )}
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--color-primary)' }} />
            <p className="text-muted mt-3">Cargando notificaciones...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center">
            <div className="mx-auto text-muted mb-3" style={{ opacity: 0.3, width: '48px', height: '48px' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <h5 className="text-muted fw-bold">Todo tranquilo por aquí</h5>
            <p className="text-muted small">Tu asesor técnico no ha enviado notificaciones aún. Cuando actualice el estado de tu servicio, aparecerá aquí.</p>
            <button className="btn btn-primary mx-auto mt-2" style={{ maxWidth: '200px' }}
              onClick={() => setVista('miServicio')}>
              Ver Mis Servicios
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notificaciones.map(n => {
              // Campos directos — ya no se usa n.parsed (estructura anterior con JSON inline)
              const leida  = n.leida === true;
              const icono  = iconoTipo(n.texto || '');
              return (
                <div key={n.Codigo_Notificaciones}
                  className={`card shadow-sm p-4 border-start border-4 stagger-item ${leida ? 'opacity-50' : ''}`}
                  style={{ borderLeftColor: leida ? 'var(--color-border)' : icono.color, borderColor: 'var(--color-border)' }}>
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    {/* Icono */}
                    <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                      style={{ width: '46px', height: '46px', backgroundColor: leida ? '#6c757d' : icono.color, fontSize: '1.1rem', color: '#fff' }}>
                      {icono.svg}
                    </div>

                    {/* Contenido */}
                    <div className="flex-grow-1">
                      <div className="fw-bold mb-1" style={{ color: leida ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                        {n.texto || n.Tipo_Notificacion}
                      </div>
                      <div className="d-flex gap-3 flex-wrap align-items-center">
                        {n.servicio && (
                          <span className="small text-muted">Servicio #{n.servicio}</span>
                        )}
                        {n.fecha && (
                          <span className="small text-muted">
                            {new Date(n.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {leida ? (
                          <span className="badge bg-secondary small">Leída</span>
                        ) : (
                          <span className="badge bg-primary small">Nueva</span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="d-flex gap-2 flex-shrink-0">
                      {n.servicio && (
                        <button className="btn btn-sm btn-outline-secondary"
                          onClick={() => setVista('miServicio')}>
                          Ver Servicio
                        </button>
                      )}
                      {!leida && (
                        <button className="btn btn-sm btn-success"
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

export default MisNotificaciones;
