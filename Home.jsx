import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Home = ({ cerrarSesion, setVista }) => {
  const [stats, setStats] = useState({
    servicios: 0, usuarios: 0, productos: 0, historial: 0
  });
  const [serviciosRecientes, setServiciosRecientes] = useState([]);
  const usuario = localStorage.getItem('user') || 'Usuario';
  const role = Number(localStorage.getItem('role')) || 2;

  const config = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Para clientes: sus propios servicios; para técnico/admin: todos
        const serviciosUrl = role === 2
          ? `http://localhost:3000/api/servicios/mis-servicios/${usuario}`
          : 'http://localhost:3000/api/servicios/listar';

        const peticiones = [
          axios.get(serviciosUrl, config()),
          axios.get('http://localhost:3000/api/productos/listar', config()),
          ...(role !== 2 ? [axios.get('http://localhost:3000/api/historial/listar', config())] : []),
          ...(role === 3 ? [axios.get('http://localhost:3000/api/usuarios/listar', config())] : []),
        ];
        const reqs = await Promise.allSettled(peticiones);

        // Índices: [0]=servicios, [1]=productos, [2]=historial(solo rol!=2), [3]=usuarios(solo rol==3)
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
    if (e <= 25)   return { texto: 'En Diagn\u00f3stico', color: '#0dcaf0' };
    if (e <= 50)   return { texto: 'En Reparaci\u00f3n',  color: '#ffc107' };
    if (e <= 75)   return { texto: 'Control de Calidad',  color: '#fd7e14' };
    if (e === 100) return { texto: 'Listo para Retirar',  color: '#198754' };
    return { texto: `Etapa ${e}`, color: '#6c757d' };
  };

  // Accesos rápidos diferenciados por rol
  const menuAccesoFiltro = role === 2
    ? [
        { label: 'Mis Servicios',       vista: 'miServicio' },
        { label: 'Chat con Asesor',     vista: 'chatVista'  },
        { label: 'Catálogo',           vista: 'catalogo'   },
        { label: 'Comentarios',         vista: 'comentarios'},
      ]
    : role === 1
    ? [
        { label: 'Gestión de Servicios', vista: 'servicios'      },
        { label: 'Chat de Soporte',      vista: 'chatVista'      },
        { label: 'Historial',            vista: 'historial'      },
        { label: 'Productos',            vista: 'productos'      },
        { label: 'Categorías',          vista: 'categorias'     },
        { label: 'Notificaciones',      vista: 'notificaciones' },
        { label: 'Comentarios',         vista: 'comentarios'    },
        { label: 'Catálogo',           vista: 'catalogo'       },
      ]
    : [
        { label: 'Gestión de Servicios', vista: 'servicios'      },
        { label: 'Usuarios',             vista: 'usuarios'       },
        { label: 'Historial',            vista: 'historial'      },
        { label: 'Productos',            vista: 'productos'      },
        { label: 'Categorías',          vista: 'categorias'     },
        { label: 'Notificaciones',      vista: 'notificaciones' },
        { label: 'Tipos de Documento',  vista: 'tipo'           },
      ];

  return (
    <div>
      {/* NAVBAR */}
      <Navbar titulo="CELUACCEL — Panel Principal" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        {/* BIENVENIDA */}
        <div className="mb-4 p-4 rounded-3 text-white" style={{ background: 'linear-gradient(135deg, #DB0000, #8B0000)' }}>
          <h4 className="fw-bold mb-1">Bienvenido, {usuario}</h4>
          <p className="mb-0 opacity-75">Este es tu panel del sistema Celuaccel.</p>
        </div>

        {/* TARJETAS DE ESTADÍSTICAS Ocultas lógicamente según rol */}
        <div className="row g-3 mb-4">
          {[
            { titulo: 'Servicios', valor: stats.servicios, icono: '', vista: role === 2 ? 'miServicio' : 'servicios', color: '#DB0000' },
            ...(role === 3 ? [{ titulo: 'Usuarios', valor: stats.usuarios, icono: '', vista: 'usuarios', color: '#121212' }] : []),
            { titulo: 'Productos', valor: stats.productos, icono: '', vista: role === 2 ? 'catalogo' : 'productos', color: '#DB0000' },
            ...(role !== 2 ? [{ titulo: 'Eventos', valor: stats.historial, icono: '', vista: 'historial', color: '#121212' }] : []),
          ].map((card, i) => (
            <div key={i} className="col-6 col-md flex-grow-1">
              <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }}
                onClick={() => setVista(card.vista)}>
                <div className="card-body text-center py-4">
                  <div style={{ fontSize: '2rem' }}>{card.icono}</div>
                  <h2 className="fw-bold my-1" style={{ color: card.color }}>{card.valor}</h2>
                  <p className="text-muted small mb-0">{card.titulo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ACCESOS RÁPIDOS ADAPTADOS */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header fw-bold" style={{ backgroundColor: '#f8f9fa' }}>
                 Accesos Rápidos
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {menuAccesoFiltro.map((acc, i) => (
                    <button key={i} className="btn text-white fw-bold"
                      style={{ backgroundColor: i % 2 === 0 ? '#DB0000' : '#121212' }}
                      onClick={() => setVista(acc.vista)}>
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICIOS RECIENTES (SOLO PARA TÉCNICOS/ADMIN) */}
        {role !== 2 && (
          <div className="card border-0 shadow-sm">
            <div className="card-header fw-bold d-flex justify-content-between align-items-center"
              style={{ backgroundColor: '#f8f9fa' }}>
              <span> Servicios Generales Recientes</span>
              <button className="btn btn-sm text-white fw-bold" style={{ backgroundColor: '#DB0000' }}
                onClick={() => setVista('servicios')}>Ver todos</button>
            </div>
            <div className="card-body p-0">
              {serviciosRecientes.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No hay servicios registrados aún.</p>
              ) : (
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
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
                        <tr key={s.ID_Servicio}>
                          <td className="fw-bold">{s.ID_Servicio}</td>
                          <td>{s.Descripcion}</td>
                          <td>{s.Movil_Nombre}</td>
                          <td style={{ minWidth: '120px' }}>
                            <div className="progress" style={{ height: '8px' }}>
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

export default Home;
