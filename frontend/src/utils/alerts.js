import Swal from 'sweetalert2';

// Configuramos una instancia con estilos por defecto que usen nuestras variables CSS
const swalPremium = Swal.mixin({
  customClass: {
    popup: 'premium-swal-popup',
    confirmButton: 'btn btn-primary px-4 fw-bold',
    cancelButton: 'btn btn-secondary px-4 fw-bold ms-2',
    title: 'fw-bold',
  },
  buttonsStyling: false,
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
});

/**
 * Muestra una alerta estilizada.
 * Reemplaza el uso de `window.alert`.
 */
export const mostrarAlerta = async (mensaje, icono = 'info', titulo = 'Aviso') => {
  return await swalPremium.fire({
    title: titulo,
    text: mensaje,
    icon: icono,
    confirmButtonText: 'Aceptar'
  });
};

/**
 * Muestra un cuadro de diálogo de confirmación.
 * Reemplaza el uso de `window.confirm`.
 * @returns {Promise<boolean>} true si el usuario confirma, false si cancela.
 */
export const confirmar = async (mensaje, titulo = '¿Estás seguro?', textConfirma = 'Sí, confirmar', textCancela = 'Cancelar') => {
  const result = await swalPremium.fire({
    title: titulo,
    text: mensaje,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: textConfirma,
    cancelButtonText: textCancela,
    reverseButtons: true
  });
  return result.isConfirmed;
};
