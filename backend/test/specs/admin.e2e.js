const LoginPage = require('../pageobjects/login.page');
const DashboardPage = require('../pageobjects/dashboard.page');
const { expect } = require('@wdio/globals');

describe('Módulo Administrador', () => {
    before(async () => {
        // Login inicial como Admin
        await browser.url('/');
        const btnLogin = await $('button=Iniciar Sesion');
        if (await btnLogin.isExisting()) {
            await btnLogin.click();
        }
        
        // Credenciales Admin
        const user = process.env.TEST_ADMIN_USER || 'admin';
        const pass = process.env.TEST_ADMIN_PASS || 'admin123';
        
        await LoginPage.login(user, pass);
        await DashboardPage.navTitle.waitForDisplayed({ timeout: 5000 });
    });

    it('debería poder navegar a Gestión de Usuarios', async () => {
        await DashboardPage.navegarA('Usuarios');
        const titulo = await $('h4*=Usuarios, h2*=Usuarios');
        await expect(titulo).toBeExisting();
    });

    it('debería poder navegar a Gestión de Roles', async () => {
        await DashboardPage.navegarA('Roles');
        const titulo = await $('h4*=Roles, h2*=Roles');
        await expect(titulo).toBeExisting();
    });

    it('debería poder navegar a Tipos de Documento', async () => {
        await DashboardPage.navegarA('Tipos de Documento');
        // Buscamos algo relacionado a tipos en la vista
        const tablaOLista = await $('table, .list-group');
        await expect(tablaOLista).toBeExisting();
    });
});
