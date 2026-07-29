const router = require('express').Router();
const ctrl = require('../controllers/garantiaController');
const { validarToken, validarRol } = require('../middlewares/authMiddleware');

/** RF-022: Garantías de Servicio */
// Cliente: sus garantías
router.get('/garantias/mis-garantias',               validarToken,              ctrl.misGarantias);
// Técnico/Admin: todas
router.get('/garantias/listar',                      validarToken, validarRol(1, 3), ctrl.listar);
// Por servicio — útil para mostrar la garantía en el detalle de orden
router.get('/garantias/por-servicio/:id',            validarToken,              ctrl.listarPorServicio);
// Verificar vigencia de garantía de un servicio
router.get('/garantias/vigencia/:id',                validarToken,              ctrl.verificarVigencia);
// Crear garantía (solo técnico y admin, sobre servicio completado)
router.post('/garantias/crear',                      validarToken, validarRol(1, 3), ctrl.crear);
// Actualizar
router.put('/garantias/actualizar',                  validarToken, validarRol(1, 3), ctrl.actualizar);
// Eliminar (solo admin)
router.delete('/garantias/eliminar/:id',             validarToken, validarRol(3),   ctrl.eliminar);

module.exports = router;
