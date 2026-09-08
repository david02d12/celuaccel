const AppError = require('../config/AppError');

const validarNombres = (nombre) => {
    if (!nombre || !nombre.trim()) throw new AppError('El nombre es obligatorio.', 400);
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']+$/.test(nombre.trim())) {
        throw new AppError('El nombre solo puede contener letras, espacios y guiones.', 400);
    }
    const partes = nombre.trim().split(/\s+/).filter(p => p.length >= 2);
    if (partes.length < 2) throw new AppError('Ingresa al menos nombre y apellido.', 400);
};

const validarCorreo = (correo) => {
    if (!correo || !correo.trim()) throw new AppError('El correo es obligatorio.', 400);
    const arrobas = (correo.match(/@/g) || []).length;
    if (arrobas !== 1) throw new AppError('El correo debe tener exactamente un @.', 400);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) throw new AppError('Ingresa un correo válido.', 400);
};

const validarTelefono = (telefono) => {
    if (!telefono || !telefono.trim()) throw new AppError('El teléfono es obligatorio.', 400);
    if (!/^3\d{9}$/.test(telefono.trim())) {
        throw new AppError('El teléfono debe ser un número celular colombiano válido (10 dígitos, iniciando con 3).', 400);
    }
};

const validarEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return;
    const parts = fechaNacimiento.split('-');
    if (parts.length === 3) {
        const dateNac = new Date(parts[0], parts[1] - 1, parts[2]);
        const hoy = new Date(); 
        hoy.setHours(0, 0, 0, 0);
        const edadAnios = (hoy - dateNac) / (1000 * 60 * 60 * 24 * 365.25);
        if (dateNac >= hoy) throw new AppError('La fecha de nacimiento debe estar en el pasado.', 400);
        if (edadAnios < 18) throw new AppError('Debes ser mayor de 18 años para usar el sistema.', 400);
        if (edadAnios > 80) throw new AppError('La edad máxima permitida es 80 años.', 400);
    }
};

const validarDocumento = (id, codTipo) => {
    if (Number(codTipo) === 2) {
        throw new AppError('La Tarjeta de Identidad no está permitida. Debes ser mayor de edad.', 400);
    }
    if (!id || !id.trim()) throw new AppError('El número de documento es obligatorio.', 400);
};

module.exports = {
    validarNombres,
    validarCorreo,
    validarTelefono,
    validarEdad,
    validarDocumento
};
