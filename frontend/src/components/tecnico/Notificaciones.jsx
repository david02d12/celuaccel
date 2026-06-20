import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

/* ─── SVG Icons ─── */
const IconBell = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
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
const IconSend = ({ color = 'white', size = 18 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconEdit = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

/* ─── Helpers ─── */
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

const textoNotif  = (n) => n.Tipo_Notificacion || n.Titulo || n.titulo || n.texto || n.Mensaje || n.mensaje || '(sin contenido)';
const fechaNotif  = (n) => n.Fecha_Notificacion || n.Fecha || n.fecha;
const esLeida     = (n) => n.Leida === 1 || n.Leida === true || n.leida === 1 || n.leida === true;
const destinoN    = (n) => n.ID_Usuario_Destino || n.idUsuarioDestino || '';
const servicioN   = (n) => n.ID_Servicio || n.idServicio || n.servicio;

const fechaCorta = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const inputStyle = { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

const Notificaciones = ({ cerrarSesion, setVista }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [busqueda, setBusqueda]             = useState('');
  const [enEdicion, setEnEdicion]           = useState(false);
  const [cargando, setCargando]             = useState(true);
  const [enviando, setEnviando]             = useState(false);
  const [toast, setToast]                   = useState(null);
  const [form, setForm] = useState({ Codigo_Notificaciones: '', ID_Usuario_Destino: '', ID_Servicio: '', Mensaje: '' });

  const notificacionesFiltradas = notificaciones.filter(n => {
    const txt  = textoNotif(n);
    const dest = destinoN(n);
    return String(n.Codigo_Notificaciones).includes(busqueda) ||
           txt.toLowerCase().includes(busqueda.toLowerCase()) ||
           dest.toLowerCase().includes(busqueda.toLowerCase());
  });

  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(notificacionesFiltradas, 7);

  useEffect(() => { listar(); }, []);

  const mostrarToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const listar = async () => {
    setCargando(true);
    try { const res = await api.get('/notificaciones/listar'); setNotificaciones(res.data); }
    catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const guardar = async () => {
    if (!form.ID_Usuario_Destino || !form.Mensaje) {
      mostrarToast('Completa los campos Destino y Mensaje.', 'danger');
      return;
    }
    setEnviando(true);
    try {
      if (enEdicion) {
        await api.put('/notificaciones/actualizar', { Codigo_Notificaciones: form.Codigo_Notificaciones, Tipo_Notificacion: form.Mensaje });
        mostrarToast('Notificación actualizada.');
      } else {
        await api.post('/notificaciones/enviar', { ID_Usuario_Destino: form.ID_Usuario_Destino, ID_Servicio: form.ID_Servicio || null, Mensaje: form.Mensaje });
        mostrarToast('Notificación enviada.');
      }
      listar(); limpiar();
    } catch { mostrarToast('Error al enviar la notificación.', 'danger'); }
    finally { setEnviando(false); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta notificación?')) return;
    try { await api.delete(`/notificaciones/eliminar/${id}`); mostrarToast('Eliminada.'); listar(); }
    catch { mostrarToast('Error al eliminar.', 'danger'); }
  };

  const limpiar = () => {
    setForm({ Codigo_Notificaciones: '', ID_Usuario_Destino: '', ID_Servicio: '', Mensaje: '' });
    setEnEdicion(false);
  };

  const sinLeer = notificaciones.filter(n => !esLeida(n)).length;

  return (
    <div>
      <Navbar titulo="CELUACCEL — Central de Notificaciones" cerrarSesion={cerrarSesion} />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, minWidth: 280 }}>
          <div className={`alert alert-${toast.tipo} toast-premium shadow mb-0 d-flex align-items-center gap-2`}>
            {toast.tipo === 'success' ? <IconCheck color="#198754" size={16} /> : <IconX color="#DB0000" size={16} />}
            <span className="fw-semibold">{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="container mt-4 pb-5">

        {/* Banner */}
        <div className="module-banner mb-4 position-relative overflow-hidden">
          <div style={{ position: 'absolute', top: -40, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 position-relative">
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBell color="white" size={26} />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-white">Central de Notificaciones</h4>
                <p className="mb-0 text-white opacity-75 small">Envía y administra notificaciones a los clientes</p>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {[
                { label: 'Total',    val: notificaciones.length, bg: 'rgba(255,255,255,0.15)', col: '#fff' },
                { label: 'Sin leer', val: sinLeer,               bg: 'rgba(255,255,255,0.9)', col: 'var(--color-primary)' },
                { label: 'Leídas',   val: notificaciones.length - sinLeer, bg: 'rgba(25,135,84,0.25)', col: '#75d09e' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: s.col, fontWeight: 700, fontSize: '1.05rem' }}>{s.val}</span>
                  <span style={{ color: s.col, fontSize: '0.75rem', opacity: 0.85 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4">

          {/* Formulario */}
          <div className="col-lg-4 col-12">
            <div className="card h-100" style={{ position: 'sticky', top: 80 }}>
              <div style={{ background: enEdicion ? 'linear-gradient(135deg,#f59e0b,#b45309)' : 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dk))', borderRadius: '14px 14px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                {enEdicion ? <IconEdit color="white" size={20} /> : <IconSend color="white" size={20} />}
                <h6 className="fw-bold text-white mb-0">{enEdicion ? 'Editar Notificación' : 'Nueva Notificación'}</h6>
              </div>
              <div className="p-4">
                <label className="small fw-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Usuario Destino *</label>
                <input className="form-control mb-3" style={{ ...inputStyle, borderRadius: 8 }} placeholder="Documento del cliente" value={form.ID_Usuario_Destino} disabled={enEdicion} onChange={e => setForm({ ...form, ID_Usuario_Destino: e.target.value })} />

                <label className="small fw-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>ID Servicio <span style={{ fontWeight: 400 }}>(opcional)</span></label>
                <input className="form-control mb-3" style={{ ...inputStyle, borderRadius: 8 }} type="number" placeholder="Número del servicio" value={form.ID_Servicio} disabled={enEdicion} onChange={e => setForm({ ...form, ID_Servicio: e.target.value })} />

                <label className="small fw-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Mensaje *</label>
                <textarea className="form-control mb-4" style={{ ...inputStyle, borderRadius: 8, resize: 'vertical', minHeight: 90 }} rows="3" placeholder="Ej: Tu equipo ya está listo para retirar." value={form.Mensaje} onChange={e => setForm({ ...form, Mensaje: e.target.value })} />

                <button className="btn btn-primary w-100 mb-2 d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: 8 }} onClick={guardar} disabled={enviando}>
                  {enviando ? <><span className="spinner-border spinner-border-sm" />Enviando...</> : <><IconSend size={16} /> {enEdicion ? 'Actualizar' : 'Enviar Notificación'}</>}
                </button>
                {enEdicion && <button className="btn w-100" style={{ borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} onClick={limpiar}>Cancelar</button>}
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="col-lg-8 col-12">
            <div className="card mb-3">
              <div className="p-3">
                <input type="text" className="form-control" style={{ ...inputStyle, borderRadius: 8 }} placeholder="Buscar por código, usuario o mensaje..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
              </div>
            </div>

            {cargando ? (
              <div className="d-flex flex-column gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="card p-4" style={{ opacity: 0.5 }}>
                    <div style={{ height: 12, width: '70%', borderRadius: 6, background: 'var(--color-border)', marginBottom: 8 }} />
                    <div style={{ height: 10, width: '45%', borderRadius: 6, background: 'var(--color-border)' }} />
                  </div>
                ))}
              </div>
            ) : notificacionesFiltradas.length === 0 ? (
              <div className="card text-center p-5 fade-in">
                <div style={{ margin: '0 auto 12px', opacity: 0.2 }}><IconBell color="var(--color-text)" size={44} /></div>
                <h6 className="fw-bold">Sin resultados</h6>
                <p className="small" style={{ color: 'var(--color-text-muted)' }}>{busqueda ? `No se encontraron resultados para "${busqueda}"` : 'No hay notificaciones registradas.'}</p>
              </div>
            ) : (
              <>
                <div className="d-flex flex-column gap-3 mb-3">
                  {datosPagina.map((n, idx) => {
                    const leida  = esLeida(n);
                    const icono  = iconoTipo(textoNotif(n));
                    const { Icon } = icono;
                    const dest   = destinoN(n) || 'General';
                    const serv   = servicioN(n);
                    const fech   = fechaNotif(n);

                    return (
                      <div key={n.Codigo_Notificaciones ?? idx} className="card stagger-item" style={{ borderLeft: `4px solid ${leida ? 'var(--color-border)' : icono.color}` }}>
                        <div className="p-3 d-flex gap-3 align-items-start">
                          {/* Ícono */}
                          <div style={{ width: 42, height: 42, minWidth: 42, borderRadius: 12, background: leida ? 'var(--color-border)' : icono.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon color={leida ? 'var(--color-text-muted)' : icono.color} size={20} />
                          </div>

                          {/* Info */}
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-start gap-2 mb-1 flex-wrap">
                              <p className="mb-0 fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--color-text)', opacity: leida ? 0.65 : 1 }}>
                                {textoNotif(n)}
                              </p>
                              <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: leida ? 'rgba(108,117,125,0.12)' : icono.bg, color: leida ? 'var(--color-text-muted)' : icono.color, border: `1px solid ${leida ? 'var(--color-border)' : icono.color + '44'}`, flexShrink: 0 }}>
                                {leida ? 'Leída' : 'Nueva'}
                              </span>
                            </div>
                            <div className="d-flex flex-wrap gap-3 align-items-center">
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>#{n.Codigo_Notificaciones}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>{dest}</span>
                              {serv && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Servicio #{serv}</span>}
                              {fech && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{fechaCorta(fech)}</span>}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="d-flex flex-column gap-1 flex-shrink-0">
                            <button style={{ borderRadius: 7, padding: '5px 12px', fontSize: '0.72rem', fontWeight: 600, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                              onClick={() => { setForm({ Codigo_Notificaciones: n.Codigo_Notificaciones, ID_Usuario_Destino: dest === 'General' ? '' : dest, ID_Servicio: servicioN(n) || '', Mensaje: textoNotif(n) }); setEnEdicion(true); }}>
                              <IconEdit size={12} /> Editar
                            </button>
                            <button style={{ borderRadius: 7, padding: '5px 12px', fontSize: '0.72rem', fontWeight: 600, border: '1.5px solid rgba(219,0,0,0.3)', background: 'rgba(219,0,0,0.07)', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                              onClick={() => eliminar(n.Codigo_Notificaciones)}>
                              <IconTrash size={12} /> Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
              </>
            )}
          </div>
        </div>
      </div>

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

export default Notificaciones;