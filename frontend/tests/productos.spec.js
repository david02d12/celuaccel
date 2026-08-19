const TECNICO_ID   = 'carlos@correo.com';
const TECNICO_PASS = '123456';

async function loginTecnico() {
  await browser.url('/');
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue(TECNICO_ID);
  await $('input[placeholder="Ingresa tu contraseña"]').setValue(TECNICO_PASS);
  await $('button=Ingresar al Sistema').click();
  await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });
}

describe('Módulo de Gestión de Productos', () => {

  it('Técnico puede acceder al inventario de productos', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnProductos = await $('#nav-productos');
    await btnProductos.waitForDisplayed({ timeout: 5000 });
    await btnProductos.click();

    const header = await $('h4=Inventario de Productos');
    await header.waitForDisplayed({ timeout: 6000 });
    expect(await header.isDisplayed()).toBe(true);
  });

  it('Técnico ve el formulario para agregar o editar un producto', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnProductos = await $('#nav-productos');
    await btnProductos.waitForDisplayed({ timeout: 5000 });
    await btnProductos.click();

    const inputNombre = await $('input[placeholder="Nombre del producto"]');
    await inputNombre.waitForDisplayed({ timeout: 5000 });
    expect(await inputNombre.isDisplayed()).toBe(true);
  });

  it('Técnico puede buscar productos en el inventario', async () => {
    await loginTecnico();

    const btnMenu = await $('button=Menú');
    await btnMenu.waitForExist({ timeout: 5000 });
    await btnMenu.click();

    const btnProductos = await $('#nav-productos');
    await btnProductos.waitForDisplayed({ timeout: 5000 });
    await btnProductos.click();

    const inputBusqueda = await $('input[placeholder*="Buscar por código"]');
    await inputBusqueda.waitForDisplayed({ timeout: 5000 });
    await inputBusqueda.setValue('ProductoInexistente12345');

    const emptyMsg = await $('p=No se encontraron productos.');
    await emptyMsg.waitForDisplayed({ timeout: 5000 });
    expect(await emptyMsg.isDisplayed()).toBe(true);
  });

});
