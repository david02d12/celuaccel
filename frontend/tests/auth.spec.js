const USUARIO_ID   = 'maria@correo.com';
const USUARIO_PASS = '123456';

describe('Módulo de Autenticación', () => {

  beforeEach(async () => {
    await browser.url('/');
    await $('#login-usuario').waitForDisplayed({ timeout: 6000 });
  });

  it('Login con credenciales válidas → entra al sistema', async () => {
    await $('#login-usuario').setValue(USUARIO_ID);
    await $('#login-password').setValue(USUARIO_PASS);
    await $('#btn-ingresar').click();

    const bienvenido = await $('h4.fw-bold');
    await bienvenido.waitForDisplayed({ timeout: 8000 });
    expect(await bienvenido.isDisplayed()).toBe(true);
  });

  it('Login con contraseña incorrecta → muestra toast de error', async () => {
    await $('#login-usuario').setValue(USUARIO_ID);
    await $('#login-password').setValue('claveIncorrecta999');
    await $('#btn-ingresar').click();

    const toast = await $('div=Usuario o contraseña incorrectos.');
    await toast.waitForDisplayed({ timeout: 5000 });
    expect(await toast.getText()).toContain('incorrectos');
  });

  it('Login sin llenar campos → muestra aviso', async () => {
    await $('#btn-ingresar').click();

    const toast = await $('div=Por favor, completa todos los campos.');
    await toast.waitForDisplayed({ timeout: 4000 });
    expect(await toast.getText()).toContain('completa todos los campos');
  });

  it('Navegar al catálogo público sin login', async () => {
    await $('#btn-catalogo-publico').click();

    const contenido = await $('h2, h4, h1, .card');
    await contenido.waitForDisplayed({ timeout: 6000 });
    expect(await contenido.isDisplayed()).toBe(true);
  });

  it('Navegar al formulario de registro', async () => {
    await $('#btn-crear-cuenta').click();

    await $('#btn-registrar').waitForDisplayed({ timeout: 5000 });
    expect(await $('#btn-registrar').isDisplayed()).toBe(true);
  });

  it('Navegar a "Olvidé mi contraseña"', async () => {
    await $('#btn-forgot-password').click();

    const form = await $('form, .card');
    await form.waitForDisplayed({ timeout: 5000 });
    expect(await form.isDisplayed()).toBe(true);
  });

});