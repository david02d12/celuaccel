import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// ── Íconos ────────────────────────────────────────────────────────────────────
const IconQuestion = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconReply = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
  </svg>
);
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconPackage = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const MisPreguntas = ({ cerrarSesion, setVista }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [expandida, setExpandida] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando]   = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [productosCatalogo, setProductosCatalogo] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]);

  const [form, setForm] = useState({
    Codigo_Producto: '',
    Pregunta: '',
  });

  const userId = sessionStorage.getItem('userId') || sessionStorage.getItem('user') || '';

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  // ── Cargar mis preguntas ────────────────────────────────────────────────────
  useEffect(() => { listar(); }, []);

  const listar = async () => {
    setCargando(true);
    try {
      const [pregRes, prodRes] = await Promise.all([
        api.get('/preguntas/mis-preguntas'),
        api.get('/productos/listar')
      ]);
      setPreguntas(pregRes.data);
      setTodosLosProductos(prodRes.data);
      setProductosCatalogo(prodRes.data.filter(p => Number(p.Activo_Catalogo) === 1));
    } catch {
      mostrarToast('Error al cargar la información.', false);
    } finally {
      setCargando(false);
    }
  };

  // ── Enviar nueva pregunta ───────────────────────────────────────────────────
  const enviar = async (e) => {
    e.preventDefault();
    if (!form.Pregunta.trim()) {
      mostrarToast('La pregunta no puede estar vacía.', false);
      return;
    }
    setEnviando(true);
    try {
      await api.post('/preguntas/agregar', {
        ID_Usuario:      userId,
        Codigo_Producto: form.Codigo_Producto.trim() || null,
        Pregunta:        form.Pregunta.trim(),
      });
      mostrarToast('✅ Pregunta enviada. El equipo técnico responderá pronto.');
      setForm({ Codigo_Producto: '', Pregunta: '' });
      setMostrarForm(false);
      listar();
    } catch (error) {
      mostrarToast(error.response?.data?.error || 'Error al enviar la pregunta.', false);
    } finally {
      setEnviando(false);
    }
  };

  const toggleExpandir = (id) => setExpandida(prev => prev === id ? null : id);

  // ── Separar respondidas y pendientes ───────────────────────────────────────
  const respondidas  = preguntas.filter(p => p.Respuesta && p.Respuesta.trim() !== '');
  const pendientes   = preguntas.filter(p => !p.Respuesta || p.Respuesta.trim() === '');

  const formatFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    return isNaN(d) ? f : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ── Card de pregunta ────────────────────────────────────────────────────────
  const CardPregunta = ({ p }) => {
    const abierta    = expandida === p.ID_Consulta;
    const respondida = p.Respuesta && p.Respuesta.trim() !== '';

    return (
      <div
        className="mb-2 rounded border"
        style={{ borderColor: respondida ? 'var(--color-border)' : '#f59e0b55', background: 'var(--color-bg)', overflow: 'hidden' }}
      >
        {/* Cabecera */}
        <button
          className="btn w-100 text-start d-flex align-items-start gap-2 px-3 py-3"
          style={{ background: 'transparent', border: 'none' }}
          onClick={() => toggleExpandir(p.ID_Consulta)}
        >
          {/* Badge estado */}
          <span
            className="badge rounded-pill mt-1 flex-shrink-0"
            style={{
              background: respondida ? 'var(--color-primary)' : '#f59e0b',
              color: '#fff',
              fontSize: '10px',
              minWidth: '72px',
              textAlign: 'center',
            }}
          >
            {respondida ? '✓ Respondida' : '⏳ Pendiente'}
          </span>

          {/* Texto pregunta */}
          <div className="flex-grow-1">
            <p className="mb-0 fw-semibold" style={{ color: 'var(--color-text)', fontSize: '14px' }}>
              {p.Pregunta}
            </p>
            <div className="d-flex gap-3 mt-1" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {p.Codigo_Producto && (
                <span className="d-flex align-items-center gap-1">
                  <IconPackage /> Producto: <strong>{todosLosProductos.find(prod => String(prod.Codigo_Producto) === String(p.Codigo_Producto))?.Nombre || ''} ({p.Codigo_Producto})</strong>
                </span>
              )}
              <span>{formatFecha(p.Fecha)}</span>
            </div>
          </div>

          {/* Chevron */}
          <span style={{ color: 'var(--color-text-muted)', transition: 'transform .2s', transform: abierta ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </button>

        {/* Respuesta (acordeón) */}
        {abierta && (
          <div className="px-3 pb-3">
            <div
              className="rounded p-3 d-flex gap-2"
              style={{ background: respondida ? 'var(--color-primary)18' : '#f59e0b12', borderLeft: `3px solid ${respondida ? 'var(--color-primary)' : '#f59e0b'}` }}
            >
              <span className="flex-shrink-0 mt-1" style={{ color: respondida ? 'var(--color-primary)' : '#f59e0b' }}>
                <IconReply />
              </span>
              <div>
                <p className="mb-0 small fw-semibold" style={{ color: respondida ? 'var(--color-primary)' : '#d97706' }}>
                  {respondida ? 'Respuesta del equipo técnico:' : 'Aún no hay respuesta para esta pregunta.'}
                </p>
                {respondida && (
                  <p className="mb-0 mt-1" style={{ color: 'var(--color-text)', fontSize: '13px' }}>
                    {p.Respuesta}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar cerrarSesion={cerrarSesion} setVista={setVista} />

      {/* TOAST */}
      {toast.visible && (
        <div
          className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '300px' }} role="alert"
        >
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <div className="d-flex flex-grow-1">
        <Sidebar setVista={setVista} cerrarSesion={cerrarSesion} />

        <main className="flex-grow-1 p-4" style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>

          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <span style={{ color: 'var(--color-primary)' }}><IconQuestion /></span>
                Mis Preguntas
              </h1>
              <p className="mb-0 small" style={{ color: 'var(--color-text-muted)' }}>
                Consulta las respuestas del equipo técnico o envía una nueva pregunta.
              </p>
            </div>
            {!mostrarForm && (
              <button
                id="btn-nueva-pregunta"
                className="btn btn-sm"
                style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontWeight: 600 }}
                onClick={() => setMostrarForm(true)}
              >
                + Nueva pregunta
              </button>
            )}
          </div>

          {/* ── Formulario nueva pregunta ──────────────────────────────────── */}
          {mostrarForm && (
            <div className="mb-4 p-4 fade-in" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
              <h6 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>Enviar nueva pregunta</h6>
              <form onSubmit={enviar}>
                <div className="mb-3">
                  <label className="form-label small fw-bold" style={{ color: 'var(--color-text-muted)' }}>
                    SELECCIONA UN PRODUCTO (opcional)
                  </label>
                  <select
                    id="select-codigo-producto"
                    className="form-select"
                    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-btn)' }}
                    value={form.Codigo_Producto}
                    onChange={e => setForm(f => ({ ...f, Codigo_Producto: e.target.value }))}
                  >
                    <option value="">-- Ninguno (Pregunta general) --</option>
                    {productosCatalogo.map(p => (
                      <option key={p.Codigo_Producto} value={p.Codigo_Producto}>
                        {p.Nombre} ({p.Codigo_Producto})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold" style={{ color: 'var(--color-text-muted)' }}>
                    TU PREGUNTA *
                  </label>
                  <textarea
                    id="input-pregunta-texto"
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-btn)', minHeight: '110px', resize: 'vertical' }}
                    placeholder="Escribe tu consulta con detalle..."
                    value={form.Pregunta}
                    onChange={e => setForm(f => ({ ...f, Pregunta: e.target.value }))}
                    required
                  />
                </div>
                <div className="d-flex justify-content-end gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary fw-bold"
                    style={{ borderRadius: 'var(--radius-btn)' }}
                    onClick={() => {
                      setMostrarForm(false);
                      setForm({ Codigo_Producto: '', Pregunta: '' });
                    }}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-enviar-pregunta"
                    type="submit"
                    className="btn d-flex align-items-center gap-2 border-0"
                    style={{ background: 'var(--color-primary)', color: '#fff', fontWeight: 600, borderRadius: 'var(--radius-btn)' }}
                    disabled={enviando}
                  >
                    {enviando
                      ? <><span className="spinner-border spinner-border-sm" /> Enviando...</>
                      : <><IconSend /> Enviar pregunta</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Cargando ──────────────────────────────────────────────────── */}
          {cargando && (
            <div className="text-center py-5" style={{ color: 'var(--color-text-muted)' }}>
              <div className="spinner-border" style={{ color: 'var(--color-primary)' }} role="status" />
              <p className="mt-2 small">Cargando preguntas...</p>
            </div>
          )}

          {/* ── Sin preguntas ─────────────────────────────────────────────── */}
          {!cargando && preguntas.length === 0 && (
            <div className="text-center py-5 rounded border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2.5rem' }}>❓</div>
              <p className="fw-semibold mt-2 mb-1" style={{ color: 'var(--color-text)' }}>Aún no tienes preguntas</p>
              <p className="small">Usa el botón <strong>"+ Nueva pregunta"</strong> para enviar tu primera consulta al equipo técnico.</p>
            </div>
          )}

          {/* ── Respondidas ───────────────────────────────────────────────── */}
          {!cargando && respondidas.length > 0 && (
            <section className="mb-4">
              <h6 className="fw-bold mb-2" style={{ color: 'var(--color-text)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ✅ Respondidas ({respondidas.length})
              </h6>
              {respondidas.map(p => <CardPregunta key={p.ID_Consulta} p={p} />)}
            </section>
          )}

          {/* ── Pendientes ────────────────────────────────────────────────── */}
          {!cargando && pendientes.length > 0 && (
            <section>
              <h6 className="fw-bold mb-2" style={{ color: 'var(--color-text)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ⏳ Pendientes ({pendientes.length})
              </h6>
              {pendientes.map(p => <CardPregunta key={p.ID_Consulta} p={p} />)}
            </section>
          )}

        </main>
      </div>
    </div>
  );
};

export default MisPreguntas;
