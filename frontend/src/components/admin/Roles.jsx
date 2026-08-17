import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { confirmar } from '../../utils/alerts';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const COLORES_ROL = {
  1: { bg: '#0d6efd', label: 'Tecnico' },
  2: { bg: '#6c757d', label: 'Cliente' },
  3: { bg: '#DB0000', label: 'Administrador' },
};

// Roles reservados del sistema — no se pueden crear, editar ni eliminar
const ROLES_SISTEMA = [1, 2, 3];
const esRolSistema = (codigo) => ROLES_SISTEMA.includes(Number(codigo));

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const Roles = ({ cerrarSesion, setVista }) => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [enEdicion, setEnEdicion] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [form, setForm] = useState({ Codigo_Rol: '', Nombre_Rol: '' });

  const rolesFiltrados = datos.filter(d =>
    String(d.Codigo_Rol).includes(busqueda) ||
    String(d.Nombre_Rol || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(rolesFiltrados, 8);

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3000);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/roles/listar');
      setDatos(res.data);
    } catch { mostrarToast('Error al cargar roles.', false); }
  };

  const guardar = async () => {
    try {
      // Validar que no sea un rol reservado del sistema
      if (ROLES_SISTEMA.includes(Number(form.Codigo_Rol))) {
        mostrarToast('No puedes crear ni modificar roles del sistema (Técnico, Cliente, Administrador).', false);
        return;
      }
      const url = enEdicion ? 'actualizar' : 'agregar';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/roles/${url}`, form);
      mostrarToast(enEdicion ? 'Rol actualizado.' : 'Rol creado.');
      listar(); limpiar();
    } catch { mostrarToast('Error al procesar la solicitud.', false); }
  };

  const eliminar = async (id) => {
    // Validar que no sea un rol reservado del sistema
    if (ROLES_SISTEMA.includes(Number(id))) {
      mostrarToast('No puedes eliminar roles del sistema (Técnico, Cliente, Administrador).', false);
      return;
    }
    if (await confirmar('¿Eliminar este rol?')) {
      try {
        await api.delete(`/roles/eliminar/${id}`);
        mostrarToast('Rol eliminado.'); listar();
      } catch { mostrarToast('Error al eliminar.', false); }
    }
  };

  const limpiar = () => { setForm({ Codigo_Rol: '', Nombre_Rol: '' }); setEnEdicion(false); };

  const inputStyle = { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' };

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white toast-premium ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '260px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Privilegios y Roles" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 text-white d-flex justify-content-between align-items-center flex-wrap gap-2 module-banner">
          <div>
            <h4 className="fw-bold mb-1">Privilegios y Roles</h4>
            <p className="mb-0 opacity-75">Configura los niveles de acceso del sistema</p>
          </div>
          <span className="badge bg-white text-danger fw-bold fs-6">{datos.length} roles</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-lg-4 col-12 mb-4">
            <div className="card p-3 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ width: 4, height: 20, background: 'var(--color-primary)', borderRadius: 2, display: 'inline-block' }}/>
                <h5 className="mb-0 fw-bold">{enEdicion ? 'Editar Rol' : 'Nuevo Rol'}</h5>
              </div>
<<<<<<< HEAD
              <input className="form-control mb-2" style={inputStyle} type="number" disabled={enEdicion}
                value={form.Codigo_Rol} placeholder="Codigo del Rol"
                onChange={e => setForm({...form, Codigo_Rol: e.target.value})} />
              <input className="form-control mb-3" style={inputStyle} value={form.Nombre_Rol}
                placeholder="Nombre del Rol"
                onChange={e => setForm({...form, Nombre_Rol: e.target.value})} />
              <button className="btn w-100 btn-primary fw-bold" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar Rol'}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
=======
              <input id="roles-input-codigo" className="form-control mb-2" style={inputStyle} type="number" disabled={enEdicion}
                value={form.Codigo_Rol} placeholder="Codigo del Rol"
                onChange={e => setForm({...form, Codigo_Rol: e.target.value})} />
              <input id="roles-input-nombre" className="form-control mb-3" style={inputStyle} value={form.Nombre_Rol}
                placeholder="Nombre del Rol"
                onChange={e => setForm({...form, Nombre_Rol: e.target.value})} />
              <button id="roles-btn-guardar" className="btn w-100 btn-primary fw-bold" onClick={guardar}>
                {enEdicion ? 'Actualizar' : 'Guardar Rol'}
              </button>
              {enEdicion && <button id="roles-btn-cancelar" className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
>>>>>>> 809efa1 (Commit de inicio)
            </div>
          </div>

          {/* CARDS DE ROLES */}
          <div className="col-lg-8 col-12">
            <div className="mb-3">
<<<<<<< HEAD
                <input type="text" className="form-control" style={inputStyle}
=======
                <input id="roles-input-buscar" type="text" className="form-control" style={inputStyle}
>>>>>>> 809efa1 (Commit de inicio)
                  placeholder="Buscar por código o descripción..."
                  value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
            </div>

            <div className="d-flex flex-column gap-2">
              {datosPagina.map(d => {
                const info = COLORES_ROL[d.Codigo_Rol] || { bg: '#6c757d', label: `Rol ${d.Codigo_Rol}` };
                return (
                  <div key={d.Codigo_Rol} className="card border-0 shadow-sm fade-in"
                    style={{ borderLeft: `4px solid ${info.bg}`, borderRadius: 10 }}>
                    <div className="card-body p-3 d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 42, height: 42, backgroundColor: `${info.bg}20` }}>
                        <span style={{ color: info.bg }}><IconShield /></span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{d.Nombre_Rol}</span>
                          <span className="badge" style={{ backgroundColor: info.bg, fontSize: '0.7rem' }}>
                            #{d.Codigo_Rol}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex gap-1 align-items-center">
                        {esRolSistema(d.Codigo_Rol) ? (
                          // Rol del sistema: sin botones, solo indicador visual
                          <span
                            className="badge d-flex align-items-center gap-1 px-2 py-1"
                            style={{ background: 'var(--color-border, #444)', color: 'var(--color-text-muted, #aaa)', fontSize: '0.72rem', fontWeight: 500, borderRadius: 6, cursor: 'default' }}
                            title="Rol del sistema protegido. No se puede editar ni eliminar."
                          >
                            🔒 Protegido
                          </span>
                        ) : (
                          <>
<<<<<<< HEAD
                            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.77rem' }}
                              onClick={() => { setEnEdicion(true); setForm(d); }}>
                              Editar
                            </button>
                            <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.77rem' }}
=======
                            <button id={`roles-btn-editar-${d.Codigo_Rol}`} className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.77rem' }}
                              onClick={() => { setEnEdicion(true); setForm(d); }}>
                              Editar
                            </button>
                            <button id={`roles-btn-borrar-${d.Codigo_Rol}`} className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.77rem' }}
>>>>>>> 809efa1 (Commit de inicio)
                              onClick={() => eliminar(d.Codigo_Rol)}>
                              Borrar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPaginas > 1 && (
              <div className="mt-3">
<<<<<<< HEAD
                <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
=======
                <Paginacion idBase="roles" pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
>>>>>>> 809efa1 (Commit de inicio)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="offcanvas offcanvas-start text-white" tabIndex="-1" id="menuGlobal">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Menu de Navegacion</h5>
<<<<<<< HEAD
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
=======
          <button id="roles-btn-cerrar-menu" type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
>>>>>>> 809efa1 (Commit de inicio)
        </div>
        <Sidebar setVista={setVista} />
      </div>
    </div>
  );
};

export default Roles;