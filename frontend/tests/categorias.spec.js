import { loginComo } from './utils/login-helper.js';

const TECNICO_ID   = 'carlos@correo.com';
const TECNICO_PASS = '123456';

async function loginTecnico() {
  await loginComo(TECNICO_ID, TECNICO_PASS);
}


describe('Módulo de Categorías', () => {

  it('Técnico puede acceder a la gestión de categorías', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnCategorias = await $('#nav-categorias');
    await btnCategorias.waitForDisplayed({ timeout: 5000 });
    await btnCategorias.click();

    const header = await $('h4=Categorias de Productos');
    await header.waitForDisplayed({ timeout: 6000 });
    expect(await header.isDisplayed()).toBe(true);
  });

  it('Técnico ve el formulario para agregar o editar una categoría', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnCategorias = await $('#nav-categorias');
    await btnCategorias.waitForDisplayed({ timeout: 5000 });
    await btnCategorias.click();

    const inputNombre = await $('input[placeholder="Nombre de la Categoria"]');
    await inputNombre.waitForDisplayed({ timeout: 5000 });
    expect(await inputNombre.isDisplayed()).toBe(true);
  });

  it('Técnico puede usar el buscador de categorías', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnCategorias = await $('#nav-categorias');
    await btnCategorias.waitForDisplayed({ timeout: 5000 });
    await btnCategorias.click();

    const inputBusqueda = await $('input[placeholder*="Buscar por código"]');
    await inputBusqueda.waitForDisplayed({ timeout: 5000 });
    await inputBusqueda.setValue('Cat');
    expect(await inputBusqueda.getValue()).toBe('Cat');
  });

});
