import { irAlLogin, loginComo } from './utils/login-helper.js';

const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';

describe('Módulo de Catálogo', () => {

  it('Ver catálogo público sin iniciar sesión (desde el login)', async () => {
    await irAlLogin();
    const btnCatalogo = await $('#btn-catalogo-publico');
    await btnCatalogo.waitForExist({ timeout: 5000 });
    await btnCatalogo.click();

    const contenido = await $('h2, h4, .card');
    await contenido.waitForDisplayed({ timeout: 6000 });
    expect(await contenido.isDisplayed()).toBe(true);
  });

  it('El catálogo público tiene botón para volver al login', async () => {
    await browser.url('/');
    await browser.execute(() => sessionStorage.clear());
    await browser.url('/');
    // Ya estamos en el catálogo público
    const btnLogin = await $('#btn-ir-login');
    await btnLogin.waitForExist({ timeout: 5000 });
    expect(await btnLogin.isExisting()).toBe(true);
  });

  it('Usuario autenticado puede acceder al catálogo', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnCatalogo = await $('#btn-acc-catalogo');
    await btnCatalogo.waitForExist({ timeout: 5000 });
    await btnCatalogo.click();

    const contenido = await $('.card, .producto, h4');
    await contenido.waitForDisplayed({ timeout: 6000 });
    expect(await contenido.isDisplayed()).toBe(true);
  });

});
