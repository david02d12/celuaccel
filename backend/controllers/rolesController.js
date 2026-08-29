/**
 * controllers/rolesController.js
 * Controlador de roles de usuario en CeluAccel.
 *
 * Gestiona los roles disponibles en el sistema: Técnico (1), Usuario (2),
 * Administrador (3). Solo los administradores tienen acceso a estos endpoints.
 *
 * Rutas que lo usan: roles.routes.js
 * Servicio que consume: roles.service.js
 *
 * Endpoints:
 *   GET    /roles/listar        → lista todos los roles
 *   POST   /roles/agregar       → crea un nuevo rol
 *   PUT    /roles/actualizar    → actualiza un rol
 *   DELETE /roles/eliminar/:id  → elimina un rol
 */
const rolesService = require('../services/roles.service');

const handleError = (res, err) =>
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });

exports.listarRoles = async (req, res) => {
    try { res.status(200).json(await rolesService.listar()); }
    catch (err) { handleError(res, err); }
};

exports.agregarRol = async (req, res) => {
    try {
        await rolesService.crear(req.body.Codigo_Rol, req.body.Nombre_Rol);
        res.status(201).json({ message: 'Rol creado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.actualizarRol = async (req, res) => {
    try {
        await rolesService.actualizar(req.body.Codigo_Rol, req.body.Nombre_Rol);
        res.status(200).json({ message: 'Rol actualizado correctamente.' });
    } catch (err) { handleError(res, err); }
};

exports.eliminarRol = async (req, res) => {
    try {
        await rolesService.eliminar(req.params.id);
        res.status(200).json({ message: 'Rol eliminado correctamente.' });
    } catch (err) { handleError(res, err); }
};