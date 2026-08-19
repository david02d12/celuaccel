import { limpiarPreguntaPrueba } from './utils/db-cleaner.js';

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

describe('Módulo de Preguntas — Usuario', () => {

  after(async () => {
    await limpiarPreguntaPrueba();
  });

  it('Usuario puede ver la sección de preguntas', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnPreguntas = await $('#nav-misPreguntas');
    await btnPreguntas.waitForExist({ timeout: 5000 });
    await btnPreguntas.click();

    const seccion = await $('#btn-nueva-pregunta');
    await seccion.waitForDisplayed({ timeout: 6000 });
    expect(await seccion.isDisplayed()).toBe(true);
  });

  it('Usuario puede enviar una nueva pregunta', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnPreguntas = await $('#nav-misPreguntas');
    await btnPreguntas.waitForExist({ timeout: 5000 });
    await btnPreguntas.click();

    const btnNueva = await $('#btn-nueva-pregunta');
    await btnNueva.waitForExist({ timeout: 5000 });
    await btnNueva.click();

    const inputPregunta = await $('#input-pregunta-texto');
    await inputPregunta.waitForExist({ timeout: 4000 });
    await inputPregunta.setValue('¿Cuánto tiempo demora una reparación de pantalla?');

    const btnEnviar = await $('#btn-enviar-pregunta');
    await btnEnviar.click();

    const confirmacion = await $('.toast-body, .alert, .fw-bold');
    await confirmacion.waitForDisplayed({ timeout: 5000 });
    expect(await confirmacion.isDisplayed()).toBe(true);
  });

});

describe('Módulo de Preguntas — Técnico', () => {

  it('Técnico puede ver las preguntas pendientes de respuesta', async () => {
    await loginComo(TECNICO_ID, TECNICO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnPreguntas = await $('#nav-preguntas');
    await btnPreguntas.waitForExist({ timeout: 5000 });
    await btnPreguntas.click();

    const tabla = await $('table, .table, .card');
    await tabla.waitForDisplayed({ timeout: 6000 });
    expect(await tabla.isDisplayed()).toBe(true);
  });

  it('Técnico ve la opción de responder una pregunta', async () => {
    await loginComo(TECNICO_ID, TECNICO_PASS);

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnPreguntas = await $('#nav-preguntas');
    await btnPreguntas.waitForExist({ timeout: 5000 });
    await btnPreguntas.click();

    const btnResponder = await $('#btn-responder-pregunta');
    await btnResponder.waitForExist({ timeout: 6000 });
    expect(await btnResponder.isExisting()).toBe(true);
  });

});
