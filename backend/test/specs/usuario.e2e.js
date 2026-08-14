const CatalogoPage = require('../pageobjects/catalogo.page');
const LoginPage = require('../pageobjects/login.page');
const DashboardPage = require('../pageobjects/dashboard.page');
const { expect } = require('@wdio/globals');

describe('Módulo de Usuario/Cliente', () => {
    it('debería cargar el catálogo público sin sesión', async () => {
        await CatalogoPage.open();
        await expect(CatalogoPage.tituloCatalogo).toBeDisplayed();
        
        // Verificar que los botones del NavBar están presentes
        await expect(CatalogoPage.btnIniciarSesionNav).toBeDisplayed();
        await expect(CatalogoPage.btnRegistrarseNav).toBeDisplayed();
    });

    it('debería iniciar sesión y acceder a Mi Servicio', async () => {
        await browser.url('/');
        const btnLogin = await $('button=Iniciar Sesion');
        if (await btnLogin.isExisting()) {
            await btnLogin.click();
        }
        
        // Usamos un usuario de prueba (se asume que existe en DB, de lo contrario esto fallará)
        // NOTA: Para una CI, se debe mockear o usar datos seed.
        const user = process.env.TEST_CLIENT_USER || 'cliente_prueba';
        const pass = process.env.TEST_CLIENT_PASS || 'ClaveSecreta123';
        
        await LoginPage.login(user, pass);
        
        // Esperamos que la vista cambie (ej. aparezca navbar interno)
        await DashboardPage.navTitle.waitForDisplayed({ timeout: 5000 });
        
        // Navegamos a Mi Servicio
        await DashboardPage.navegarA('Mi Servicio');
        
        // Verificamos que se haya cargado (busca un título o contenedor general)
        const tituloSeccion = await $('h2*=Servicio, h3*=Servicio, h4*=Servicio'); // Selector flexible
        await expect(tituloSeccion).toBeExisting();
    });
});
