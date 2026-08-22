/**
 * tests/utils/login-helper.js
 * Helper compartido para todos los specs E2E.
 *
 * La app arranca en el catálogo público cuando no hay token en sessionStorage.
 * loginComo() navega al login pasando por el catálogo y luego autentica al usuario.
 */

/**
 * Navega a / (catálogo público), va al login y autentica con las credenciales dadas.
 * @param {string} id   — correo o número de documento
 * @param {string} pass — contraseña
 */
export async function loginComo(id, pass) {
  await browser.url('/');
  // Limpiamos la sesión en caso de que un test anterior haya dejado un usuario logueado
  await browser.execute(() => sessionStorage.clear());
  await browser.url('/');

  // El catálogo público tiene el botón #btn-ir-login
  const btnIrLogin = await $('#btn-ir-login');
  await btnIrLogin.waitForDisplayed({ timeout: 6000 });
  await btnIrLogin.click();

  // Ahora estamos en el login
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue(id);
  await $('input[placeholder="Ingresa tu contraseña"]').setValue(pass);
  await $('button=Ingresar al Sistema').click();
  await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });
}

/**
 * Navega al catálogo público y hace clic en "ir al login" para llegar al formulario de login.
 * Útil para tests de autenticación que necesitan empezar en el login.
 */
export async function irAlLogin() {
  await browser.url('/');
  await browser.execute(() => sessionStorage.clear());
  await browser.url('/');
  const btnIrLogin = await $('#btn-ir-login');
  await btnIrLogin.waitForDisplayed({ timeout: 6000 });
  await btnIrLogin.click();
  await $('#login-usuario').waitForDisplayed({ timeout: 5000 });
}
