/**
 * tests/registro.spec.js
 * Pruebas E2E del módulo de registro — CeluAccel
 *
 * Selectores por #id definidos en Registro.jsx.
 */
import { limpiarUsuarioPrueba } from './utils/db-cleaner.js';

async function irARegistro() {
  await browser.url('/');
  await $('#btn-crear-cuenta').waitForDisplayed({ timeout: 5000 });
  await $('#btn-crear-cuenta').click();
  await $('#btn-registrar').waitForDisplayed({ timeout: 5000 });
}

describe('Módulo de Registro', () => {

  after(async () => {
    await limpiarUsuarioPrueba();
  });

  it('Todos los campos del formulario están visibles', async () => {
    await irARegistro();
    expect(await $('#reg-tipo-doc').isDisplayed()).toBe(true);
    expect(await $('#reg-id-usuario').isDisplayed()).toBe(true);
    expect(await $('#reg-nombre').isDisplayed()).toBe(true);
    expect(await $('#reg-correo').isDisplayed()).toBe(true);
    expect(await $('#reg-clave').isDisplayed()).toBe(true);
    expect(await $('#reg-clave-confirm').isDisplayed()).toBe(true);
  });

  it('Enviar sin campos → muestra error de campos obligatorios', async () => {
    await irARegistro();
    await $('#btn-registrar').click();

    const toast = await $('.toast-body');
    await toast.waitForDisplayed({ timeout: 4000 });
    expect(await toast.isDisplayed()).toBe(true);
  });

  it('Contraseña menor a 6 caracteres → bloquea el registro', async () => {
    await irARegistro();

    await $('#reg-tipo-doc').selectByVisibleText('Cédula de Ciudadanía');
    await $('#reg-id-usuario').setValue('1234567890');
    await $('#reg-nombre').setValue('Juan Pérez');
    await $('#reg-correo').setValue('test@correo.com');
    await $('#reg-clave').setValue('abc');
    await $('#btn-registrar').click();

    const toast = await $('.toast-body');
    await toast.waitForDisplayed({ timeout: 4000 });
    expect(await toast.isDisplayed()).toBe(true);
  });

  it('Contraseñas que no coinciden → bloquea el registro', async () => {
    await irARegistro();

    await $('#reg-tipo-doc').selectByVisibleText('Cédula de Ciudadanía');
    await $('#reg-id-usuario').setValue('1234567890');
    await $('#reg-nombre').setValue('Juan Pérez');
    await $('#reg-correo').setValue('test@correo.com');
    await $('#reg-clave').setValue('123456');
    await $('#reg-clave-confirm').setValue('654321');
    await $('#btn-registrar').click();

    const toast = await $('.toast-body');
    await toast.waitForDisplayed({ timeout: 4000 });
    expect(await toast.getText()).toContain('coinciden');
  });

  it('Indicador verde cuando las contraseñas coinciden', async () => {
    await irARegistro();

    await $('#reg-clave').setValue('mi123clave');
    await $('#reg-clave-confirm').setValue('mi123clave');

    const ok = await $('.text-success');
    await ok.waitForDisplayed({ timeout: 3000 });
    expect(await ok.getText()).toContain('coinciden');
  });

  it('Volver al login desde el registro', async () => {
    await irARegistro();
    await $('#btn-ir-login').click();

    await $('#btn-ingresar').waitForDisplayed({ timeout: 5000 });
    expect(await $('#btn-ingresar').isDisplayed()).toBe(true);
  });

});
