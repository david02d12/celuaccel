import { loginComo } from './utils/login-helper.js';

const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';


describe('Módulo de Perfil de Usuario', () => {

  it('Usuario puede acceder a su perfil y ver sus datos personales', async () => {
    await loginComo(USUARIO_ID, USUARIO_PASS);

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnPerfil = await $('#nav-perfil');
    await btnPerfil.waitForDisplayed({ timeout: 5000 });
    await btnPerfil.click();

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

    const inputNombres = await $('input[placeholder="Ej: Juan Carlos"]');
    await inputNombres.waitForDisplayed({ timeout: 5000 });
    expect(await inputNombres.isDisplayed()).toBe(true);

    const btnCancelar = await $('button=Cancelar');
    await btnCancelar.click();

    const panelDatos = await $('//*[contains(text(), "Información del Perfil")]');
    await panelDatos.waitForDisplayed({ timeout: 6000 });
    expect(await panelDatos.isDisplayed()).toBe(true);
  });

});
