import { useState, useEffect } from 'react';
import api from '../services/api';

const calcFechaLimites = () => {
  const hoy = new Date();
  const maxDate = new Date(hoy.getFullYear() - 10, hoy.getMonth(), hoy.getDate()).toISOString().split('T')[0];
  const minDate = new Date(hoy.getFullYear() - 80, hoy.getMonth(), hoy.getDate()).toISOString().split('T')[0];
  return { minDate, maxDate };
};

const REGLAS_DOC = {
  '1': { nombre: 'Cédula',               min: 6,  max: 10, soloNumeros: true,  regex: /^\d{6,10}$/ },
  '2': { nombre: 'Tarjeta de Identidad', min: 10, max: 11, soloNumeros: true,  regex: /^\d{10,11}$/ },
  '3': { nombre: 'Cédula de Extranjería',min: 6,  max: 12, soloNumeros: false, regex: /^[A-Za-z0-9]{6,12}$/ },
  '4': { nombre: 'Pasaporte',            min: 5,  max: 15, soloNumeros: false, regex: /^[A-Za-z0-9]{5,15}$/ },
  '5': { nombre: 'PEP',                  min: 15, max: 17, soloNumeros: false, regex: /^[A-Za-z0-9]{15,17}$/ },
};

const validarNombres = (nombres) => {
  if (!nombres || !nombres.trim()) return 'Los nombres son obligatorios.';
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']+$/.test(nombres.trim()))
    return 'Los nombres solo pueden contener letras, espacios y guiones.';
  const partes = nombres.trim().split(/\s+/).filter(p => p.length >= 2);
  if (partes.length < 1) return 'Ingresa al menos 1 nombre (mínimo 2 letras).';
  if (partes.length > 3) return 'Máximo 3 nombres permitidos.';
  return '';
};

const validarApellidos = (apellidos) => {
  if (!apellidos || !apellidos.trim()) return 'Los apellidos son obligatorios.';
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']+$/.test(apellidos.trim()))
    return 'Los apellidos solo pueden contener letras, espacios y guiones.';
  const partes = apellidos.trim().split(/\s+/).filter(p => p.length >= 2);
  if (partes.length < 1) return 'Ingresa al menos 1 apellido (mínimo 2 letras).';
  if (partes.length > 2) return 'Máximo 2 apellidos permitidos.';
  return '';
};

const validarDocumento = (id, codTipo) => {
  const regla = REGLAS_DOC[String(codTipo)];
  if (!regla) return 'Selecciona un tipo de documento primero.';
  if (!id.trim()) return 'El número de documento es obligatorio.';
  if (!regla.regex.test(id.trim())) {
    return regla.soloNumeros
      ? `El número debe tener entre ${regla.min} y ${regla.max} dígitos numéricos.`
      : `El número debe tener entre ${regla.min} y ${regla.max} caracteres alfanuméricos.`;
  }
  return '';
};

const validarTelefono = (tel) => {
  if (!tel.trim()) return '';
  if (!/^\d+$/.test(tel.trim())) return 'El teléfono solo debe contener números.';
  if (tel.trim().length < 7) return `Mínimo 7 dígitos (actualmente ${tel.trim().length}).`;
  if (tel.trim().length > 10) return 'Máximo 10 dígitos.';
  return '';
};

const validarDireccion = (dir) => {
  if (!dir.trim()) return '';
  if (dir.trim().length < 8) return `Mínimo 8 caracteres para una dirección válida (actualmente ${dir.trim().length}).`;
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(dir)) return 'La dirección debe contener texto (calle, carrera, etc.).';
  if (!/\d/.test(dir)) return 'La dirección debe contener al menos un número (ej: Calle 45 #12-30).';
  return '';
};

export const fuerzaClave = (clave) => {
  if (!clave) return { nivel: 0, texto: '', color: '' };
  let pts = 0;
  if (clave.length >= 6)  pts++;
  if (clave.length >= 10) pts++;
  if (/[A-Z]/.test(clave)) pts++;
  if (/[0-9]/.test(clave)) pts++;
  if (/[^A-Za-z0-9]/.test(clave)) pts++;
  if (pts <= 1) return { nivel: 1, texto: 'Débil',  color: '#dc3545' };
  if (pts <= 3) return { nivel: 2, texto: 'Media',  color: '#ffc107' };
  return             { nivel: 3, texto: 'Fuerte', color: '#198754' };
};

export const useRegistroForm = (setModoRegistro, setVista) => {
  const [formReg, setFormReg] = useState({
    ID_Usuario: '', Codigo_Documento: '', Nombres: '', Apellidos: '',
    Fecha_Nacimiento: '', Direccion: '', Telefono: '', Correo: '', Clave: '', ClaveConfirm: ''
  });
  const [tiposDoc, setTiposDoc] = useState([]);
  const [toast, setToast] = useState({ visible: false, msg: '', ok: true });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    setTiposDoc([
      { Codigo_Documento: 1, Tipo_Documento: 'Cédula de Ciudadanía' },
      { Codigo_Documento: 2, Tipo_Documento: 'Tarjeta de Identidad' },
      { Codigo_Documento: 3, Tipo_Documento: 'Cédula de Extranjería' },
      { Codigo_Documento: 4, Tipo_Documento: 'Pasaporte' },
      { Codigo_Documento: 5, Tipo_Documento: 'PEP' },
    ]);
  }, []);

  const { minDate, maxDate } = calcFechaLimites();
  const infoFuerza = fuerzaClave(formReg.Clave);

  const mostrarToast = (msg, ok) => {
    setToast({ visible: true, msg, ok });
    setTimeout(() => setToast({ visible: false, msg: '', ok: true }), 3500);
  };

  const actualizar = (campo, valor) => {
    const nuevo = { ...formReg, [campo]: valor };
    setFormReg(nuevo);

    const errs = { ...errores };
    if (campo === 'Nombres')          errs.Nombres   = validarNombres(valor);
    if (campo === 'Apellidos')        errs.Apellidos = validarApellidos(valor);
    if (campo === 'Telefono')         errs.Telefono  = validarTelefono(valor);
    if (campo === 'Direccion')        errs.Direccion = validarDireccion(valor);
    if (campo === 'ID_Usuario')       errs.ID_Usuario = validarDocumento(valor, nuevo.Codigo_Documento);
    if (campo === 'Codigo_Documento') errs.ID_Usuario = validarDocumento(nuevo.ID_Usuario, valor);
    if (campo === 'Correo') {
      const arrs = (valor.match(/@/g) || []).length;
      errs.Correo = arrs > 1 ? 'El correo debe tener exactamente un @.' : '';
    }
    setErrores(errs);
  };

  const registrarUsuario = async () => {
    if (!formReg.ID_Usuario || !formReg.Nombres || !formReg.Apellidos || !formReg.Correo || !formReg.Clave || !formReg.Codigo_Documento) {
      mostrarToast('Por favor completa todos los campos obligatorios (*).', false);
      return;
    }
    const errNombres = validarNombres(formReg.Nombres);
    if (errNombres) { mostrarToast(errNombres, false); return; }
    const errApellidos = validarApellidos(formReg.Apellidos);
    if (errApellidos) { mostrarToast(errApellidos, false); return; }
    const errDoc = validarDocumento(formReg.ID_Usuario, formReg.Codigo_Documento);
    if (errDoc) { mostrarToast(errDoc, false); return; }
    const errTel = validarTelefono(formReg.Telefono);
    if (errTel) { mostrarToast(errTel, false); return; }
    const errDir = validarDireccion(formReg.Direccion);
    if (errDir) { mostrarToast(errDir, false); return; }
    const arrobas = (formReg.Correo.match(/@/g) || []).length;
    if (arrobas !== 1) { mostrarToast('El correo debe contener exactamente un símbolo @.', false); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formReg.Correo.trim())) {
      mostrarToast('Ingresa un correo válido (ej: usuario@dominio.com).', false); return;
    }
    if (formReg.Clave.trim().length < 6) {
      mostrarToast('La contraseña debe tener mínimo 6 caracteres.', false); return;
    }
    if (formReg.Clave.trim().length > 15) {
      mostrarToast('La contraseña no puede exceder los 15 caracteres.', false); return;
    }
    if (formReg.Clave.trim() !== formReg.ClaveConfirm.trim()) {
      mostrarToast('Las contraseñas no coinciden. Verifícalas e intenta de nuevo.', false); return;
    }
    if (formReg.Fecha_Nacimiento) {
      const parts = formReg.Fecha_Nacimiento.split('-');
      if (parts.length === 3) {
        const dateNac = new Date(parts[0], parts[1] - 1, parts[2]);
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const edadAnios = (hoy - dateNac) / (1000 * 60 * 60 * 24 * 365.25);
        if (dateNac >= hoy) { mostrarToast('La fecha debe estar en el pasado.', false); return; }
        if (edadAnios < 10) { mostrarToast('Debes tener al menos 10 años para registrarte.', false); return; }
        if (edadAnios > 80) { mostrarToast('La edad máxima permitida es 80 años.', false); return; }
      }
    }
    try {
      // Combina nombres y apellidos en el campo Nombre que espera el backend
      const nombreCompleto = `${formReg.Nombres.trim()} ${formReg.Apellidos.trim()}`;
      await api.post('/registro', {
        ...formReg,
        Nombre: nombreCompleto,
        ID_Usuario: formReg.ID_Usuario.trim(),
        Correo: formReg.Correo.trim(),
        Clave: formReg.Clave.trim()
      });
      mostrarToast('¡Registro exitoso! Ya puedes iniciar sesión.', true);
      setTimeout(() => {
        if (setModoRegistro) setModoRegistro(false);
        if (setVista) setVista('login');
      }, 2000);
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al registrar el usuario.', false);
    }
  };

  const reglaDoc = REGLAS_DOC[String(formReg.Codigo_Documento)] || null;

  return {
    formReg,
    tiposDoc,
    toast,
    errores,
    minDate,
    maxDate,
    infoFuerza,
    reglaDoc,
    actualizar,
    registrarUsuario
  };
};
