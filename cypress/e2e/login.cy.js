const USUARIO_ID = '1022922817';
const USUARIO_PASS = '1022922817';

describe('Módulo de Autenticación (Login)', () => {
    beforeEach(() => {

        cy.visit('http://localhost:5173/');

        cy.get('#login-usuario').should('be.visible');
    });

    it('Login con credenciales válidas → entra al sistema', () => {
        cy.get('#login-usuario').type(USUARIO_ID);
        cy.get('#login-password').type(USUARIO_PASS);
        cy.get('#btn-ingresar').click();


        cy.get('h4.fw-bold').should('be.visible');
    });

    it('Login con contraseña incorrecta → muestra toast de error', () => {
        cy.get('#login-usuario').type(USUARIO_ID);
        cy.get('#login-password').type('claveIncorrecta999');
        cy.get('#btn-ingresar').click();


        cy.contains('Usuario o contraseña incorrectos.').should('be.visible');
    });

    it('Login sin llenar campos → muestra aviso', () => {
        cy.get('#btn-ingresar').click();


        cy.contains('Por favor, completa todos los campos.').should('be.visible');
    });

    it('Navegar al formulario de registro', () => {
        cy.get('#btn-crear-cuenta').click();

        // Debería mostrar el botón de registro
        cy.get('#btn-registrar').should('be.visible');
    });


});
