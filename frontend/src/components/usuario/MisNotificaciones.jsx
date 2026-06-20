import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

/* ─── SVG Icons sin emojis ─── */
const IconBell = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconCheck = ({ color = '#198754', size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLineJoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = ({ color = '#DB0000', size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSearch = ({ color = '#0D6EFD', size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconWrench = ({ color = '#F59E0B', size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" viewBox="0 0 24 24">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IconFlask = ({ color = '#8B5CF6', size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" viewBox="0 0 24 24">
    <path d="M9 3h6v10l4 8H5l4-8V3z"/><line x1="9" y1="13" x2="15" y2="13"/>
  </svg>
);

const iconoTipo = (texto = '') => {
  const t = texto.toLowerCase();
  if (t.includes('listo') || t.includes('retirar') || t.includes('entregado'))
    return { color: '#198754', bg: 'rgba(25,135,84,0.10)', Icon: IconCheck };
  if (t.includes('cancel'))
    return { color: '#DB0000', bg: 'rgba(219,0,0,0.10)', Icon: IconX };
  if (t.includes('diagnos'))
    return { color: '#0D6EFD', bg: 'rgba(13,110,253,0.10)', Icon: IconSearch };
  if (t.includes('reparac'))
    return { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', Icon: IconWrench };
  if (t.includes('calidad') || t.includes('control'))
    return { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', Icon: IconFlask };
  return { color: 'var(--color-primary)', bg: 'var(--color-primary-lt)', Icon: IconBell };
};

const fechaRelativa = (iso) => {
  if (!iso) return '';
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMs / 3600000);
  const diffD   = Math.floor(diffMs / 86400000);
  if (diffMin < 1)  return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffH   < 24) return `Hace ${diffH} h`;
  if (diffD   <  7) return `Hace ${diffD} día${diffD !== 1 ? 's' : ''}`;
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ─── Helpers de campos flexibles ─── */
const textoNotif = (n) => n.Tipo_Notificacion || n.Titulo || n.titulo || n.texto || n.Mensaje || n.mensaje || '';
const fechaNotif = (n) => n.Fecha_Notificacion || n.Fecha || n.fecha;
const esLeida    = (n) => n.Leida === 1 || n.Leida === true || n.leida === 1 || n.leida === true;
const servicioNotif = (n) => n.ID_Servicio || n.idServicio || n.servicio;

const MisNotificaciones = ({ cerrarSesion, setVista }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando]             = useState(true);
  const [filtro, setFiltro]                 = useState('todas');

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
    try { await api.patch(`/notificaciones/marcar-leida/${id}`, {}); cargar(); }
    catch (err) { console.error(err); }
  };

  const marcarTodasLeidas = async () => {
    try { await api.patch('/notificaciones/marcar-todas-leidas', {}); cargar(); }
    catch (err) { console.error(err); }
  };

  const sinLeer  = notificaciones.filter(n => !esLeida(n)).length;
  const total    = notificaciones.length;

  const notifFiltradas = notificaciones.filter(n => {
    if (filtro === 'nuevas')  return !esLeida(n);
    if (filtro === 'leidas')  return  esLeida(n);
    return true;
  });

  /* ─── Pill button style ─── */
  const pillStyle = (key) => ({
    borderRadius: 99, padding: '6px 20px', fontSize: '0.82rem', fontWeight: 600,
    border: '1.5px solid',
    borderColor: filtro === key ? 'var(--color-primary)' : 'var(--color-border)',
    background:  filtro === key ? 'var(--color-primary)' : 'var(--color-surface)',
    color:       filtro === key ? '#fff' : 'var(--color-text-muted)',
    cursor: 'pointer', transition: 'all 0.2s ease'
  });

  return (
    <div>
      <Navbar titulo="CELUACCEL — Mis Notificaciones" cerrarSesion={cerrarSesion} />

      <div className="container mt-4 pb-5">

        {/* ── Banner ── */}
        <div className="module-banner mb-4 position-relative overflow-hidden">
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 80, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 position-relative">
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
                <IconBell color="white" size={26} />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-white">Centro de Notificaciones</h4>
                <p className="mb-0 text-white opacity-75 small">Mensajes de tu asesor sobre el estado de tus servicios</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 14px' }}>
                <span className="text-white fw-bold">{total}</span>
                <span className="text-white opacity-75 small ms-1">totales</span>
              </div>
              {sinLeer > 0 && (
                <>
                  <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 10, padding: '6px 14px' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{sinLeer}</span>
                    <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }} className="ms-1">sin leer</span>
                  </div>
                  <button className="btn btn-sm btn-outline-light fw-semibold" style={{ borderRadius: 8 }} onClick={marcarTodasLeidas}>
                    Marcar todas leídas
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          <button style={pillStyle('todas')}  onClick={() => setFiltro('todas')}>Todas ({total})</button>
          <button style={pillStyle('nuevas')} onClick={() => setFiltro('nuevas')}>Sin leer ({sinLeer})</button>
          <button style={pillStyle('leidas')} onClick={() => setFiltro('leidas')}>Leídas ({total - sinLeer})</button>
        </div>

        {/* ── Contenido ── */}
        {cargando ? (
          <div className="d-flex flex-column gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="card p-4" style={{ opacity: 0.5 }}>
                <div style={{ height: 12, width: '60%', borderRadius: 6, background: 'var(--color-border)', marginBottom: 10 }} />
                <div style={{ height: 10, width: '40%', borderRadius: 6, background: 'var(--color-border)' }} />
              </div>
            ))}
          </div>
        ) : notifFiltradas.length === 0 ? (
          <div className="card text-center p-5 border-0 fade-in">
            <div style={{ margin: '0 auto 16px', opacity: 0.25 }}>
              <IconBell color="var(--color-text)" size={48} />
            </div>
            <h5 className="fw-bold mb-2">
              {filtro === 'nuevas' ? 'Estás al día' : filtro === 'leidas' ? 'Sin notificaciones leídas' : 'Sin notificaciones'}
            </h5>
            <p className="small mb-4" style={{ color: 'var(--color-text-muted)', maxWidth: 360, margin: '0 auto 16px' }}>
              Cuando tu asesor actualice el estado de tu servicio, aparecerá aquí.
            </p>
            <button className="btn btn-primary mx-auto" style={{ maxWidth: 200 }} onClick={() => setVista('miServicio')}>
              Ver Mis Servicios
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notifFiltradas.map((n, idx) => {
              const leida  = esLeida(n);
              const icono  = iconoTipo(textoNotif(n));
              const { Icon } = icono;
              const serv   = servicioNotif(n);
              const fech   = fechaNotif(n);

              return (
                <div key={n.Codigo_Notificaciones ?? idx}
                  className="card stagger-item"
                  style={{ borderLeft: `4px solid ${leida ? 'var(--color-border)' : icono.color}`, opacity: leida ? 0.72 : 1, transition: 'all 0.22s ease', cursor: leida ? 'default' : 'pointer' }}
                  onClick={() => !leida && marcarLeida(n.Codigo_Notificaciones)}
                  title={leida ? '' : 'Clic para marcar como leída'}>

                  <div className="p-4 d-flex gap-3 align-items-start">
                    {/* Ícono */}
                    <div style={{ width: 46, height: 46, minWidth: 46, borderRadius: 12, background: leida ? 'var(--color-border)' : icono.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon color={leida ? 'var(--color-text-muted)' : icono.color} size={22} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-1">
                        <p className="mb-0 fw-semibold" style={{ color: leida ? 'var(--color-text-muted)' : 'var(--color-text)', fontSize: '0.93rem', lineHeight: 1.4 }}>
                          {textoNotif(n) || 'Notificación'}
                        </p>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: leida ? 'var(--color-border)' : icono.bg, color: leida ? 'var(--color-text-muted)' : icono.color, border: `1px solid ${leida ? 'var(--color-border)' : icono.color + '33'}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {leida ? 'Leída' : 'Nueva'}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        {serv && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Servicio #{serv}</span>}
                        {fech && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{fechaRelativa(fech)}</span>}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="d-flex flex-column gap-2 flex-shrink-0">
                      {serv && (
                        <button className="btn btn-sm" style={{ borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={(e) => { e.stopPropagation(); setVista('miServicio'); }}>
                          Ver servicio
                        </button>
                      )}
                      {!leida && (
                        <button className="btn btn-sm" style={{ borderRadius: 8, border: `1.5px solid ${icono.color}55`, background: icono.bg, color: icono.color, fontSize: '0.75rem', padding: '4px 10px', fontWeight: 700 }}
                          onClick={(e) => { e.stopPropagation(); marcarLeida(n.Codigo_Notificaciones); }}>
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

      {/* Menú lateral */}
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
