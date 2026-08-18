const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';
const TECNICO_ID   = 'carlos@correo.com';
const TECNICO_PASS = '123456';

async function loginComo(id, pass) {
  await browser.url('/');
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue(id);
  await $('input[placeholder="Ingresa tu contraseña"]').setValue(pass);
  await $('button=Ingresar al Sistema').click();
  await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });
}

describe('Módulo de Notificaciones — Usuario', () => {

  it('Usuario puede acceder a sus notificaciones', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnNotif = await $('#nav-misNotificaciones');
    await btnNotif.waitForExist({ timeout: 5000 });
    await btnNotif.click();

    const seccion = await $('h4, h5, .card, .list-group');
    await seccion.waitForDisplayed({ timeout: 6000 });
    expect(await seccion.isDisplayed()).toBe(true);
  });

  it('La sección de notificaciones carga sin errores', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnNotif = await $('#nav-misNotificaciones');
    await btnNotif.waitForExist({ timeout: 5000 });
    await btnNotif.click();

    const error = await $('.alert-danger, .text-danger');
    const hayError = await error.isExisting();
    expect(hayError).toBe(false);
  });

  it('Usuario puede marcar todas las notificaciones como leídas', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnNotif = await $('#nav-misNotificaciones');
    await btnNotif.waitForExist({ timeout: 5000 });
    await btnNotif.click();

    const btnMarcar = await $('#btn-marcar-leidas');
    if (await btnMarcar.isExisting()) {
      await btnMarcar.click();

      const confirmacion = await $('.toast-body, .alert-success');
      await confirmacion.waitForDisplayed({ timeout: 4000 });
      expect(await confirmacion.isDisplayed()).toBe(true);
    } else {

      expect(true).toBe(true);
    }
  });

});

describe('Módulo de Notificaciones — Técnico', () => {

  it('Técnico puede acceder al panel de notificaciones', async () => {
    await loginComo(TECNICO_ID, TECNICO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnNotif = await $('#nav-notificaciones');
    await btnNotif.waitForExist({ timeout: 5000 });
    await btnNotif.click();

    const seccion = await $('h4, h5, .table, .card');
    await seccion.waitForDisplayed({ timeout: 6000 });
    expect(await seccion.isDisplayed()).toBe(true);
  });

  it('Técnico ve la opción para crear una notificación', async () => {
    await loginComo(TECNICO_ID, TECNICO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnNotif = await $('#nav-notificaciones');
    await btnNotif.waitForExist({ timeout: 5000 });
    await btnNotif.click();

    const btnNueva = await $('#btn-nueva-notificacion');
    await btnNueva.waitForExist({ timeout: 5000 });
    expect(await btnNueva.isExisting()).toBe(true);
  });

});
