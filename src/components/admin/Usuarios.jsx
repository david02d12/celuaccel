import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import api from '../../services/api';
import { usePaginacion } from '../../hooks/usePaginacion';
import Paginacion from '../Paginacion';

const Usuarios = ({ cerrarSesion, setVista }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [enEdicion, setEnEdicion] = useState(false);
  const [form, setForm] = useState({
    ID_Usuario: '',
    Codigo_Documento: '',
    Nombre: '',
    Fecha_Nacimiento: '',
    Direccion: '',
    Telefono: '',
    Correo: '',
    Clave: '',
    Codigo_Rol: 2
  });

  

  const mostrarToast = (msg, ok = true) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  useEffect(() => { listar(); }, []);

  const listar = async () => {
    try {
      const res = await api.get('/usuarios/listar');
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al listar usuarios:", err);
    }
  };

  const guardar = async () => {
    try {
      const url = enEdicion ? 'usuarios/actualizar' : 'registro';
      const metodo = enEdicion ? 'put' : 'post';
      await api[metodo](`/${url}`, form);
      mostrarToast(enEdicion ? 'Usuario actualizado correctamente.' : 'Usuario registrado en el sistema.');
      listar();
      limpiar();
    } catch (err) {
      mostrarToast('Error al procesar usuario. Verifica los datos o si el ID ya existe.', false);
    }
  };

  const eliminar = async (id) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${id}?`)) {
      try {
        await api.delete(`/usuarios/eliminar/${id}`);
        mostrarToast('Usuario eliminado del sistema.');
        listar();
      } catch (err) {
        mostrarToast('Error al eliminar usuario.', false);
      }
    }
  };

  const limpiar = () => {
    setForm({ ID_Usuario: '', Codigo_Documento: '', Nombre: '', Fecha_Nacimiento: '', Direccion: '', Telefono: '', Correo: '', Clave: '', Codigo_Rol: 2 });
    setEnEdicion(false);
  };

  const prepararEdicion = (u) => {
    // El <input type="date"> necesita estrictamente "YYYY-MM-DD"
    const fechaFormateada = u.Fecha_Nacimiento
      ? new Date(u.Fecha_Nacimiento).toISOString().split('T')[0]
      : '';
    setForm({ ...u, Fecha_Nacimiento: fechaFormateada, Clave: '' });
    setEnEdicion(true);
  };

  const nombreRol = (codigo) => {
    if (codigo === 1) return 'Técnico';
    if (codigo === 2) return 'Cliente';
    if (codigo === 3) return 'Administrador';
    return `Rol ${codigo}`;
  };

  const usuariosFiltrados = usuarios.filter(u =>
    String(u.ID_Usuario).toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.Correo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    nombreRol(u.Codigo_Rol).toLowerCase().includes(busqueda.toLowerCase())
  );

  const { pagina, setPagina, totalPaginas, datosPagina } = usePaginacion(usuariosFiltrados, 7);

  return (
    <div>
      {toast.visible && (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toast.ok ? 'bg-success' : 'bg-danger'}`}
          style={{ zIndex: 9999, minWidth: '280px' }} role="alert">
          <div className="toast-body fw-bold">{toast.msg}</div>
        </div>
      )}

      <Navbar titulo="CELUACCEL — Directorio de Usuarios" cerrarSesion={cerrarSesion} />

      <div className="container mt-4">
        <div className="mb-4 p-4 rounded-3 text-white d-flex justify-content-between align-items-center flex-wrap gap-2"
          style={{ background: 'linear-gradient(135deg, #DB0000, #8B0000)' }}>
          <div>
            <h4 className="fw-bold mb-1">Directorio de Usuarios</h4>
            <p className="mb-0 opacity-75">Gestiona cuentas, roles y datos personales de cada persona en el sistema</p>
          </div>
          <span className="badge bg-light text-danger fw-bold fs-6">{usuarios.length} usuarios</span>
        </div>

        <div className="row">
          {/* FORMULARIO */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold">{enEdicion ? "Editar Perfil" : "Registrar Usuario"}</h5>
              <hr />
              <div className="row">
                <div className="col-6">
                  <input className="form-control mb-2" placeholder="ID Usuario" value={form.ID_Usuario} disabled={enEdicion} onChange={e => setForm({...form, ID_Usuario: e.target.value})} />
                </div>
                <div className="col-6">
                  <input className="form-control mb-2" type="number" placeholder="Cód. Documento" value={form.Codigo_Documento} onChange={e => setForm({...form, Codigo_Documento: e.target.value})} />
                </div>
              </div>
              <input className="form-control mb-2" placeholder="Nombre Completo" value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} />
              <input className="form-control mb-2" type="date" title="Fecha de Nacimiento" value={form.Fecha_Nacimiento} onChange={e => setForm({...form, Fecha_Nacimiento: e.target.value})} />
              <input className="form-control mb-2" placeholder="Dirección" value={form.Direccion} onChange={e => setForm({...form, Direccion: e.target.value})} />
              <input className="form-control mb-2" placeholder="Teléfono" value={form.Telefono} onChange={e => setForm({...form, Telefono: e.target.value})} />
              <input className="form-control mb-2" type="email" placeholder="Correo Electrónico" value={form.Correo} onChange={e => setForm({...form, Correo: e.target.value})} />
              <input className="form-control mb-2" type="password" placeholder={enEdicion ? "Nueva Clave (opcional)" : "Contraseña"} value={form.Clave} onChange={e => setForm({...form, Clave: e.target.value})} />

              <select className="form-select mb-3" value={form.Codigo_Rol} onChange={e => setForm({...form, Codigo_Rol: Number(e.target.value)})}>
                <option value={1}>Técnico</option>
                <option value={2}>Cliente</option>
                <option value={3}>Administrador</option>
              </select>

              <button className="btn w-100 text-white fw-bold" style={{ backgroundColor: '#DB0000' }} onClick={guardar}>
                {enEdicion ? "Actualizar Datos" : "Registrar"}
              </button>
              {enEdicion && <button className="btn btn-secondary w-100 mt-2" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>

          {/* TABLA DE USUARIOS */}
          <div className="col-md-8">
            <div className="card shadow-sm overflow-hidden">
              <div className="p-3 border-bottom">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por ID, nombre, correo o rol..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>ID / Usuario</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {datosPagina.map(u => (
                      <tr key={u.ID_Usuario}>
                        <td className="fw-bold">{u.ID_Usuario}</td>
                        <td>{u.Nombre}</td>
                        <td>{u.Correo}</td>
                        <td>
                          <span className="badge" style={{ backgroundColor:
                            u.Codigo_Rol === 1 ? '#0d6efd' :
                            u.Codigo_Rol === 3 ? '#DC3545' : '#121212'
                          }}>
                            {nombreRol(u.Codigo_Rol)}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm me-1 text-white" style={{ backgroundColor: '#121212' }} onClick={() => prepararEdicion(u)}>Editar</button>
                          <button className="btn btn-sm text-white" style={{ backgroundColor: '#DB0000' }} onClick={() => eliminar(u.ID_Usuario)}>Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3">
                <Paginacion pagina={pagina} setPagina={setPagina} totalPaginas={totalPaginas} />
              </div>
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

export default Usuarios;