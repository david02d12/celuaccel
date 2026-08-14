const LoginPage = require('../pageobjects/login.page');
const RegistroPage = require('../pageobjects/registro.page');
const DashboardPage = require('../pageobjects/dashboard.page');
const { expect } = require('@wdio/globals');

describe('Módulo de Autenticación', () => {
    
    beforeEach(async () => {
        // Asumiendo que el login es accesible si se navega a / y se hace clic en Iniciar Sesión, 
        // o si se fuerza la URL (ej. si el frontend detecta vista=login).
        // Según App.jsx, al principio carga catalogo público.
        await browser.url('/');
        const btnLoginNav = await $('button=Iniciar Sesion');
        if (await btnLoginNav.isExisting()) {
            await btnLoginNav.click();
        }
    });

    it('debería mostrar error con credenciales incorrectas', async () => {
        await LoginPage.login('usuario_inexistente', 'ClaveFalsa123');
        
        const toast = await LoginPage.toastMessage;
        await toast.waitForDisplayed({ timeout: 5000 });
        await expect(toast).toHaveText(expect.stringContaining('incorrectos'));
    });

    it('debería navegar al registro desde el login', async () => {
        await LoginPage.linkRegistro.click();
        await expect(RegistroPage.inputIdUsuario).toBeDisplayed();
        await expect(RegistroPage.btnSubmit).toBeDisplayed();
    });

    it('debería registrar un nuevo cliente de prueba exitosamente', async () => {
        await LoginPage.linkRegistro.click();
        const idPrueba = `900${Math.floor(Math.random() * 1000000)}`;
        
        await RegistroPage.registrar(
            idPrueba, 
            '1', // Asumiendo que 1 es 'CC' u otro tipo existente
            'Cliente Prueba E2E', 
            `prueba_e2e_${idPrueba}@correo.com`, 
            'ClaveSecreta123'
        );

        // Debería salir toast verde o redirigir
        const toast = await RegistroPage.toastMessage;
        await toast.waitForDisplayed({ timeout: 6000 });
        await expect(toast).toHaveText(expect.stringContaining('exitosamente'));
    });
});
