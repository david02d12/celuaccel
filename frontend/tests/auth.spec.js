describe('Módulo de Autenticación', () => {

  it('Debe permitir iniciar sesión con credenciales válidas', async () => {

    // 1. Navegar a la página de login
    await browser.url('/');

    // 2. Localizar los elementos del formulario
    const userInput = await $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]');
    const passwordInput = await $('input[placeholder="Ingresa tu contraseña"]');
    const submitButton = await $('button=Ingresar al Sistema');

    // 3. Esperar a que el formulario sea interactivo
    await userInput.waitForDisplayed({ timeout: 5000 });

    // 4. Llenar los campos
    await userInput.setValue('1022922817');
    await passwordInput.setValue('123456789');

    // 5. Hacer clic en el botón de ingresar
    await submitButton.click();

    // 6. Validar que el inicio de sesión fue exitoso
    const welcomeHeader = await $('h4.fw-bold');

    await welcomeHeader.waitForDisplayed({ timeout: 8000 });
    const headerText = await welcomeHeader.getText();
    expect(headerText).toContain('Bienvenido');
  });

});