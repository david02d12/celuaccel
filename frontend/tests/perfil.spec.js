/**
 * tests/perfil.spec.js
 * Pruebas E2E del módulo de Perfil de Usuario — CeluAccel
 */

const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';

async function loginComo(id, pass) {
  await browser.url('/');
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue(id);
  await $('input[placeholder="Ingresa tu contraseña"]').setValue(pass);
  await $('button=Ingresar al Sistema').click();
  await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });
}

describe('Módulo de Perfil de Usuario', () => {

  it('Usuario puede acceder a su perfil y ver sus datos personales', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnPerfil = await $('#nav-perfil');
    await btnPerfil.waitForDisplayed({ timeout: 5000 });
    await btnPerfil.click();

    // Verifica que cargue el nombre o información
    const panelDatos = await $('//*[contains(text(), "Información del Perfil")]');
    await panelDatos.waitForDisplayed({ timeout: 6000 });
    expect(await panelDatos.isDisplayed()).toBe(true);
  });

  it('Usuario puede editar su perfil y cancelar', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnPerfil = await $('#nav-perfil');
    await btnPerfil.waitForDisplayed({ timeout: 5000 });
    await btnPerfil.click();

    const btnEditar = await $('button=Editar Perfil');
    await btnEditar.waitForDisplayed({ timeout: 6000 });
    await btnEditar.click();

    const inputNombre = await $('input[placeholder="Ej: Juan Pérez"]');
    await inputNombre.waitForDisplayed({ timeout: 5000 });
    expect(await inputNombre.isDisplayed()).toBe(true);

    const btnCancelar = await $('button=Cancelar');
    await btnCancelar.click();

    const panelDatos = await $('//*[contains(text(), "Información del Perfil")]');
    await panelDatos.waitForDisplayed({ timeout: 6000 });
    expect(await panelDatos.isDisplayed()).toBe(true);
  });

});
