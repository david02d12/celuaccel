/**
 * validaciones.js
 * Funciones de validación compartidas entre Registro.jsx y Perfil.jsx.
 * Centralizar aquí evita duplicación y reduce la complejidad ciclomática
 * de los componentes individuales.
 */

// ── Nombre completo ───────────────────────────────────────────────────────────
export const validarNombre = (nombre) => {
  if (!nombre.trim()) return 'El nombre completo es obligatorio.';
  const palabras = nombre.trim().split(/\s+/).filter(p => p.length >= 2);
  if (palabras.length < 2) return 'Ingresa mínimo 1 nombre y 1 apellido (ej: Juan Pérez).';
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']+$/.test(nombre.trim()))
    return 'El nombre solo puede contener letras, espacios y guiones.';
  return '';
};

// ── Correo electrónico ────────────────────────────────────────────────────────
export const validarCorreo = (correo) => {
  if (!correo.trim()) return 'El correo electrónico es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()))
    return 'Ingresa un correo válido (debe contener @ y un dominio, ej: usuario@gmail.com).';
  return '';
};

// ── Teléfono colombiano ───────────────────────────────────────────────────────
export const validarTelefono = (tel) => {
  if (!tel.trim()) return ''; // opcional
  if (!/^\d+$/.test(tel.trim())) return 'El teléfono solo debe contener números.';
  const t = tel.trim();
  if (t.length === 10 && t.startsWith('3')) return ''; // celular colombiano válido
  if (t.length === 7) return '';                        // teléfono fijo válido
  if (t.length === 10 && !t.startsWith('3'))
    return 'Los celulares colombianos deben iniciar con 3 (ej: 3001234567).';
  return 'Ingresa un teléfono válido: celular colombiano (10 dígitos, inicia en 3) o fijo (7 dígitos).';
};

// ── Dirección ─────────────────────────────────────────────────────────────────
export const validarDireccion = (dir) => {
  if (!dir.trim()) return ''; // opcional
  if (dir.trim().length < 8)
    return `Mínimo 8 caracteres para una dirección válida (actualmente ${dir.trim().length}).`;
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(dir))
    return 'La dirección debe contener texto (calle, carrera, etc.).';
  if (!/\d/.test(dir))
    return 'La dirección debe contener al menos un número (ej: Calle 45 #12-30).';
  return '';
};

// ── Fecha de nacimiento (mín 10 años, máx 80 años) ───────────────────────────
export const calcFechaLimites = () => {
  const hoy = new Date();
  const maxDate = new Date(hoy.getFullYear() - 10, hoy.getMonth(), hoy.getDate())
    .toISOString().split('T')[0];
  const minDate = new Date(hoy.getFullYear() - 80, hoy.getMonth(), hoy.getDate())
    .toISOString().split('T')[0];
  return { minDate, maxDate };
};

// ── Indicador de fuerza de contraseña ────────────────────────────────────────
export const fuerzaClave = (clave) => {
  if (!clave) return { nivel: 0, texto: '', color: '' };
  let pts = 0;
  if (clave.length >= 6)          pts++;
  if (clave.length >= 10)         pts++;
  if (/[A-Z]/.test(clave))        pts++;
  if (/[0-9]/.test(clave))        pts++;
  if (/[^A-Za-z0-9]/.test(clave)) pts++;
  if (pts <= 1) return { nivel: 1, texto: 'Débil',  color: '#dc3545' };
  if (pts <= 3) return { nivel: 2, texto: 'Media',  color: '#ffc107' };
  return           { nivel: 3, texto: 'Fuerte', color: '#198754' };
};
