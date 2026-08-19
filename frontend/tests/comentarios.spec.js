import { limpiarComentarioPrueba } from './utils/db-cleaner.js';

const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';

async function loginUsuario() {
  await browser.url('/');
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue(USUARIO_ID);
  await $('input[placeholder="Ingresa tu contraseña"]').setValue(USUARIO_PASS);
  await $('button=Ingresar al Sistema').click();
  await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });
}

async function irAComentarios() {
  const btn = await $('#btn-acc-comentarios');
  await btn.waitForExist({ timeout: 5000 });
  await btn.click();
}

describe('Módulo de Comentarios — Usuario', () => {

  after(async () => {
    await limpiarComentarioPrueba();
  });

  it('Usuario puede acceder a la sección de comentarios', async () => {
    await loginUsuario();
    await irAComentarios();

    const seccion = await $('h4, h5, .card, .table');
    await seccion.waitForDisplayed({ timeout: 6000 });
    expect(await seccion.isDisplayed()).toBe(true);
  });

  it('Usuario ve el formulario para dejar un comentario', async () => {
    await loginUsuario();
    await irAComentarios();

    const textarea = await $('#comentario-input');
    await textarea.waitForExist({ timeout: 5000 });
    expect(await textarea.isExisting()).toBe(true);
  });

  it('Usuario puede enviar un comentario con texto', async () => {
    await loginUsuario();
    await irAComentarios();

    const textarea = await $('#comentario-input');
    await textarea.waitForExist({ timeout: 4000 });
    await textarea.setValue('Excelente servicio, muy rápidos y profesionales.');

    const btnEnviar = await $('#btn-enviar-comentario');
    await btnEnviar.click();

    await browser.waitUntil(async () => (await textarea.getValue()) === '', { timeout: 5000 });
  });

  it('Los comentarios existentes se muestran en pantalla', async () => {
    await loginUsuario();
    await irAComentarios();

    const items = await $$('.card, tr');
    await browser.waitUntil(
      async () => items.length > 0,
      { timeout: 6000, timeoutMsg: 'No se cargaron comentarios.' }
    );
    expect(items.length).toBeGreaterThanOrEqual(0);
  });

});
