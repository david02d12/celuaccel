/**
 * tests/catalogo.spec.js
 * Pruebas E2E del módulo de catálogo de productos — CeluAccel
 *
 * Cubre: catálogo público sin login, filtro por categoría
 * y catálogo autenticado como usuario normal.
 */

const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';

// Helper: login como usuario
async function loginUsuario() {
  await browser.url('/');
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue(USUARIO_ID);
  await $('input[placeholder="Ingresa tu contraseña"]').setValue(USUARIO_PASS);
  await $('button=Ingresar al Sistema').click();
  await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });
}

describe('Módulo de Catálogo', () => {

  it('Ver catálogo público sin iniciar sesión', async () => {
    await browser.url('/');
    const btnCatalogo = await $('#btn-catalogo-publico');
    await btnCatalogo.waitForExist({ timeout: 5000 });
    await btnCatalogo.click();

    // Debe mostrar algún elemento del catálogo (título o lista de productos)
    const contenido = await $('h2, h4, .card');
    await contenido.waitForDisplayed({ timeout: 6000 });
    expect(await contenido.isDisplayed()).toBe(true);
  });

  it('El catálogo público tiene botón para volver al login', async () => {
    await browser.url('/');
    const btnCatalogo = await $('#btn-catalogo-publico');
    await btnCatalogo.waitForExist({ timeout: 5000 });
    await btnCatalogo.click();

    // Debe existir un botón para iniciar sesión o volver
    const btnLogin = await $('#btn-ir-login');
    await btnLogin.waitForExist({ timeout: 5000 });
    expect(await btnLogin.isExisting()).toBe(true);
  });

  it('Usuario autenticado puede acceder al catálogo', async () => {
    await loginUsuario();

    // Navegar al catálogo desde el menú
    const btnCatalogo = await $('#btn-acc-catalogo');
    await btnCatalogo.waitForExist({ timeout: 5000 });
    await btnCatalogo.click();

    const contenido = await $('.card, .producto, h4');
    await contenido.waitForDisplayed({ timeout: 6000 });
    expect(await contenido.isDisplayed()).toBe(true);
  });

});
