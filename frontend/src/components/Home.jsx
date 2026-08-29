import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Home = ({ cerrarSesion, setVista }) => {
  const [stats, setStats] = useState({
    servicios: 0, usuarios: 0, productos: 0, historial: 0
  });
  const [serviciosRecientes, setServiciosRecientes] = useState([]);
  const usuario = sessionStorage.getItem('user') || 'Usuario';
  const nombre  = sessionStorage.getItem('nombre') || usuario; // nombre real, fallback al ID
  const role = Number(sessionStorage.getItem('role')) || 2;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioNum = Number(usuario);
        if (role === 2 && !Number.isInteger(usuarioNum)) return;
        
        const serviciosUrl = role === 2
          ? `/servicios/mis-servicios/${usuarioNum}`
          : '/servicios/listar';

        const peticiones = [
          api.get(serviciosUrl),
          api.get('/productos/listar'),
          ...(role !== 2 ? [api.get('/historial/listar')] : []),
          ...(role === 3 ? [api.get('/usuarios/listar')] : []),
        ];
        const reqs = await Promise.allSettled(peticiones);

        setStats({
          servicios: reqs[0]?.status === 'fulfilled' ? reqs[0].value.data.length : 0,
          productos: reqs[1]?.status === 'fulfilled' ? reqs[1].value.data.length : 0,
          historial: role !== 2 && reqs[2]?.status === 'fulfilled' ? reqs[2].value.data.length : 0,
          usuarios:  role === 3  && reqs[3]?.status === 'fulfilled' ? reqs[3].value.data.length : 0,
        });
        if (reqs[0].status === 'fulfilled') setServiciosRecientes(reqs[0].value.data.slice(0, 5));
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
      }
    };
    cargarDatos();
  }, []);

  const etapaLabel = (etapa) => {
    const e = Number(etapa);
    if (e === -1)  return { texto: 'Cancelado',           color: '#6c757d' };
    if (e === 0)   return { texto: 'Recibido',             color: '#0d6efd' };
    if (e <= 25)   return { texto: 'En Diagnóstico',       color: '#0dcaf0' };
    if (e <= 50)   return { texto: 'En Reparación',        color: '#ffc107' };
    if (e <= 75)   return { texto: 'Control de Calidad',   color: '#8b5cf6' };
    if (e === 100) return { texto: 'Listo para Retirar',   color: '#198754' };
    return { texto: `Etapa ${e}`, color: '#6c757d' };
  };

  // Se han removido las vistas duplicadas que ya están en las tarjetas superiores (Servicios, Productos, Historial/Eventos, Usuarios)
  const menuAccesoFiltro = role === 2
    ? [
        { label: 'Chat con Asesor',     vista: 'chatVista' },
        { label: 'Notificaciones',      vista: 'misNotificaciones' },
        { label: 'Mis Preguntas',       vista: 'misPreguntas' },
        { label: 'Comentarios',         vista: 'comentarios' },
        { label: 'Mi Perfil',           vista: 'perfil' },
      ]
    : role === 1
    ? [
        { label: 'Chat de Soporte',     vista: 'chatVista' },
        { label: 'Notificaciones',      vista: 'notificaciones' },
        { label: 'Categorías',          vista: 'categorias' },
        { label: 'Preguntas',           vista: 'preguntas' },
        { label: 'Catálogo',            vista: 'catalogo' },
        { label: 'Comentarios',         vista: 'comentarios' },
        { label: 'Mi Perfil',           vista: 'perfil' },
      ]
    : [
        { label: 'Chat de Soporte',     vista: 'chatVista' },
        { label: 'Notificaciones',      vista: 'notificaciones' },
        { label: 'Categorías',          vista: 'categorias' },
        { label: 'Preguntas',           vista: 'preguntas' },
        { label: 'Catálogo',            vista: 'catalogo' },
        { label: 'Comentarios',         vista: 'comentarios' },
        { label: 'Tipos Doc.',          vista: 'tipo' },
        { label: 'Roles',               vista: 'roles' },
        { label: 'Mi Perfil',           vista: 'perfil' },
      ];

  return (
    <div>
      <Navbar titulo="CELUACCEL — Panel Principal" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BIENVENIDA */}
        <div className="mb-4 text-center module-banner">
          <h4 className="fw-bold mb-1">Bienvenido, {nombre}</h4>
          <p className="mb-0 opacity-75">Este es tu panel del sistema Celuaccel.</p>
        </div>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="row g-3 mb-4">
          {[
            { titulo: 'Servicios', valor: stats.servicios, vista: role === 2 ? 'miServicio' : 'servicios', isPrimary: true },
            ...(role === 3 ? [{ titulo: 'Usuarios', valor: stats.usuarios, vista: 'usuarios', isPrimary: false }] : []),
            { titulo: 'Productos', valor: stats.productos, vista: role === 2 ? 'catalogo' : 'productos', isPrimary: true },
            ...(role !== 2 ? [{ titulo: 'Eventos', valor: stats.historial, vista: 'historial', isPrimary: false }] : []),
          ].map((card, i) => (
            <div key={i} className="col-6 col-md flex-grow-1">
              <div className="card border-0 shadow-sm h-100 card-hover" style={{ cursor: 'pointer', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} role="button" tabIndex="0"
                onClick={() => setVista(card.vista)}
                onKeyDown={(e) => { if (e.key === 'Enter') setVista(card.vista); }}>
                <div className="card-body text-center py-4">
                  <h2 className="fw-bold my-1" style={{ color: card.isPrimary ? 'var(--color-primary)' : 'var(--color-text)' }}>{card.valor}</h2>
                  <p className="text-muted small mb-0">{card.titulo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3 ms-1" style={{ color: 'var(--color-text)' }}>Accesos Rápidos</h5>
          <div className="row g-3">
            {menuAccesoFiltro.map((acc, i) => (
              <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2 stagger-item">
                <div 
                  id={`btn-acc-${acc.vista}`} 
                  className="card border-0 shadow-sm h-100 card-hover" style={{ cursor: 'pointer', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} onClick={() => setVista(acc.vista)}
                  role="button" tabIndex="0"
                  onKeyDown={(e) => { if (e.key === 'Enter') setVista(acc.vista); }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-3">
                    <span className="fw-bold" style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>{acc.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SERVICIOS RECIENTES (SOLO PARA TÉCNICOS/ADMIN) */}
        {role !== 2 && (
          <div className="card border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
            <div className="card-header bg-transparent border-bottom fw-bold d-flex justify-content-between align-items-center"
              style={{ borderColor: 'var(--color-border)' }}>
              <span> Servicios Generales Recientes</span>
              <button className="btn btn-sm btn-primary fw-bold"
                onClick={() => setVista('servicios')}>Ver todos</button>
            </div>
            <div className="card-body p-0 table-responsive">
              {serviciosRecientes.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No hay servicios registrados aún.</p>
              ) : (
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Descripción</th>
                      <th>Dispositivo</th>
                      <th>Progreso</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviciosRecientes.map(s => {
                      const etapa = Number(s.Etapa) || 0;
                      const label = etapaLabel(etapa);
                      return (
                        <tr key={s.ID_Servicio} className="stagger-item" style={{ cursor: 'pointer' }} onClick={() => {
                          sessionStorage.setItem('searchServicio', String(s.ID_Servicio));
                          setVista('servicios');
                        }}>
                          <td className="fw-bold">{s.ID_Servicio}</td>
                          <td>{s.Descripcion}</td>
                          <td>{s.Movil_Nombre}</td>
                          <td style={{ minWidth: '120px' }}>
                            <div className="progress" style={{ height: '8px', backgroundColor: 'var(--color-border)' }}>
                              <div className="progress-bar" role="progressbar"
                                style={{ width: `${etapa}%`, backgroundColor: label.color }}
                                aria-valuenow={etapa} aria-valuemin="0" aria-valuemax="100" />
                            </div>
                            <small className="text-muted">{etapa}%</small>
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: label.color }}>
                              {label.texto}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
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

export default Home;
