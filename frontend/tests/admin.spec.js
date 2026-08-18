const ADMIN_ID   = '1022922817';
const ADMIN_PASS = '1022922817';

async function loginAdmin() {
  await browser.url('/');
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
  await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue(ADMIN_ID);
  await $('input[placeholder="Ingresa tu contraseña"]').setValue(ADMIN_PASS);
  await $('button=Ingresar al Sistema').click();
  await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });
}

describe('Panel de Administrador — Usuarios', () => {

  it('Admin puede navegar al listado de usuarios', async () => {
    await loginAdmin();

    const btnUsuarios = await $('#btn-acc-usuarios');
    await btnUsuarios.waitForExist({ timeout: 5000 });
    await btnUsuarios.click();

    const tabla = await $('input[placeholder*="Buscar por ID"]');
    await tabla.waitForDisplayed({ timeout: 6000 });
    expect(await tabla.isDisplayed()).toBe(true);
  });

  it('El listado de usuarios muestra al menos un registro', async () => {
    await loginAdmin();

    const btnUsuarios = await $('#btn-acc-usuarios');
    await btnUsuarios.waitForExist({ timeout: 5000 });
    await btnUsuarios.click();

    await $('input[placeholder*="Buscar por ID"]').waitForDisplayed({ timeout: 6000 });
    const filas = await $$('.card.border-0');
    expect(filas.length).toBeGreaterThan(0);
  });

  it('Admin ve la opción de editar un usuario', async () => {
    await loginAdmin();

    const btnUsuarios = await $('#btn-acc-usuarios');
    await btnUsuarios.waitForExist({ timeout: 5000 });
    await btnUsuarios.click();

    const btnEditar = await $('#btn-editar-usuario');
    await btnEditar.waitForExist({ timeout: 6000 });
    expect(await btnEditar.isExisting()).toBe(true);
  });

});

describe('Panel de Administrador — Roles', () => {

  it('Admin puede navegar al módulo de roles', async () => {
    await loginAdmin();

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnRoles = await $('#nav-roles');
    await btnRoles.waitForExist({ timeout: 5000 });
    await btnRoles.click();

    const seccion = await $('table, .table, .card');
    await seccion.waitForDisplayed({ timeout: 6000 });
    expect(await seccion.isDisplayed()).toBe(true);
  });

  it('El listado de roles muestra los roles del sistema', async () => {
    await loginAdmin();

    const btnMenu = await $('button[data-bs-target="#menuGlobal"]');
    if (await btnMenu.isDisplayed()) {
      await btnMenu.click();
      await browser.pause(500);
    }
    const btnRoles = await $('#nav-roles');
    await btnRoles.waitForExist({ timeout: 5000 });
    await btnRoles.click();

    const seccion = await $('.card');
    await seccion.waitForDisplayed({ timeout: 6000 });
    expect(await seccion.isDisplayed()).toBe(true);
  });

});

describe('Panel de Administrador — Tipos de Documento', () => {

  it('Admin puede ver los tipos de documento', async () => {
    await loginAdmin();

    const btnTipo = await $('#btn-acc-tipo');
    await btnTipo.waitForExist({ timeout: 5000 });
    await btnTipo.click();

    const seccion = await $('table, .table, .card');
    await seccion.waitForDisplayed({ timeout: 6000 });
    expect(await seccion.isDisplayed()).toBe(true);
  });

  it('Admin ve la opción de agregar un nuevo tipo de documento', async () => {
    await loginAdmin();

    const btnTipo = await $('#btn-acc-tipo');
    await btnTipo.waitForExist({ timeout: 5000 });
    await btnTipo.click();

    const btnAgregar = await $('#btn-agregar-tipo');
    await btnAgregar.waitForExist({ timeout: 5000 });
    expect(await btnAgregar.isExisting()).toBe(true);
  });

  it('Usuarios sin rol admin NO pueden acceder a Tipo Documento', async () => {

    await browser.url('/');
    await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').waitForDisplayed({ timeout: 5000 });
    await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]').setValue('maria@correo.com');
    await $('input[placeholder="Ingresa tu contraseña"]').setValue('123456');
    await $('button=Ingresar al Sistema').click();
    await $('h4.fw-bold').waitForDisplayed({ timeout: 8000 });

    const btnTipo = await $('#btn-acc-tipo');
    const existe = await btnTipo.isExisting();
    expect(existe).toBe(false);
  });

});
