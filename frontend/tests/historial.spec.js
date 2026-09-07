import { loginComo } from './utils/login-helper.js';

const TECNICO_ID   = 'carlos@correo.com';
const TECNICO_PASS = '123456';

async function loginTecnico() {
  await loginComo(TECNICO_ID, TECNICO_PASS);
}


describe('Módulo de Historial de Eventos', () => {

  it('Técnico puede acceder al historial de eventos', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnHistorial = await $('#nav-historial');
    await btnHistorial.waitForDisplayed({ timeout: 5000 });
    await btnHistorial.click();

    const header = await $('h4=Historial de Eventos');
    await header.waitForDisplayed({ timeout: 6000 });
    expect(await header.isDisplayed()).toBe(true);
  });

  it('Técnico ve el formulario para agregar o editar un evento manual', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnHistorial = await $('#nav-historial');
    await btnHistorial.waitForDisplayed({ timeout: 5000 });
    await btnHistorial.click();

    const inputID = await $('input[placeholder="ID del Servicio asociado"]');
    await inputID.waitForDisplayed({ timeout: 5000 });
    expect(await inputID.isDisplayed()).toBe(true);
  });

  it('Técnico puede exportar el historial a PDF', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnHistorial = await $('#nav-historial');
    await btnHistorial.waitForDisplayed({ timeout: 5000 });
    await btnHistorial.click();

    const btnExportar = await $('button=Exportar PDF');
    await btnExportar.waitForDisplayed({ timeout: 5000 });
    await btnExportar.click();

    const toast = await $('.toast-body');
    await toast.waitForDisplayed({ timeout: 5000 });
    const text = await toast.getText();
    expect(text === 'PDF exportado correctamente.' || text === 'No hay eventos para exportar.').toBe(true);
  });

});
