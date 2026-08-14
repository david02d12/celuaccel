const LoginPage = require('../pageobjects/login.page');
const DashboardPage = require('../pageobjects/dashboard.page');
const { expect } = require('@wdio/globals');

describe('Módulo Técnico', () => {
    it('debería iniciar sesión como técnico y navegar a Servicios', async () => {
        await browser.url('/');
        const btnLogin = await $('button=Iniciar Sesion');
        if (await btnLogin.isExisting()) {
            await btnLogin.click();
        }
        
        // Credenciales técnico (requiere inyección vía ENV o Seed)
        const user = process.env.TEST_TECNICO_USER || 'tecnico';
        const pass = process.env.TEST_TECNICO_PASS || 'tecnico123';
        
        await LoginPage.login(user, pass);
        
        await DashboardPage.navTitle.waitForDisplayed({ timeout: 5000 });
        
        // Navegar a servicios
        await DashboardPage.navegarA('Servicios');
        const titulo = await $('h4*=Servicios, h2*=Servicios');
        await expect(titulo).toBeExisting();
    });

    it('debería poder navegar al inventario de Productos', async () => {
        await DashboardPage.navegarA('Productos');
        const titulo = await $('h4*=Productos, h2*=Productos');
        await expect(titulo).toBeExisting();
    });
});
