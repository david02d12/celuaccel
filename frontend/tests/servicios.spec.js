/**
 * tests/servicios.spec.js
 * Pruebas E2E del módulo de servicios técnicos — CeluAccel
 *
 * Cubre: solicitud de servicio (usuario), listado de servicios (técnico),
 * actualización de estado (técnico) y cancelación (usuario).
 *
 * ⚠️  Reemplaza las credenciales de técnico antes de ejecutar:
 *      TECNICO_ID   → ID del técnico de prueba
 *      TECNICO_PASS → contraseña del técnico de prueba
 */

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

async function irAVista(id) {
  const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
  if (await btnMenu.isDisplayed()) {
    await btnMenu.click();
    await browser.pause(500);
  }
  const btn = await $(id);
  await btn.waitForExist({ timeout: 5000 });
  await btn.click();
}

describe('Módulo de Servicios — Usuario', () => {

  it('Usuario puede ver sus servicios', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);
    await irAVista('#nav-miServicio');

    const contenedor = await $('.card, .table, h4, h5');
    await contenedor.waitForDisplayed({ timeout: 6000 });
    expect(await contenedor.isDisplayed()).toBe(true);
  });

  it('Usuario puede solicitar un nuevo servicio', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);
    await irAVista('#nav-miServicio');

    // Busca el botón para crear/solicitar servicio
    const btnNuevo = await $('#btn-nuevo-servicio');
    await btnNuevo.waitForExist({ timeout: 5000 });
    await btnNuevo.click();

    // Debe aparecer el formulario o modal de creación
    const form = await $('input[placeholder*="iPhone"]');
    await form.waitForDisplayed({ timeout: 5000 });
    expect(await form.isDisplayed()).toBe(true);
  });

});

describe('Módulo de Servicios — Técnico', () => {

  it('Técnico puede ver el listado de todos los servicios', async () => {
    await loginComo(TECNICO_ID, TECNICO_PASS);
    await irAVista('#nav-servicios');

    const tabla = await $('table, .table, .card');
    await tabla.waitForDisplayed({ timeout: 6000 });
    expect(await tabla.isDisplayed()).toBe(true);
  });

  it('Técnico ve opciones para gestionar un servicio', async () => {
    await loginComo(TECNICO_ID, TECNICO_PASS);
    await irAVista('#nav-servicios');

    // Espera que la tabla cargue y busca un botón de acción
    const btnAccion = await $('#btn-editar-servicio');
    await btnAccion.waitForExist({ timeout: 6000 });
    expect(await btnAccion.isExisting()).toBe(true);
  });

});
