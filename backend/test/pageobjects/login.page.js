class LoginPage {
    /**
     * Define selectores usando getter methods
     */
    get inputUsername () {
        return $('input[placeholder="Ej: 1001234567 o correo@ejemplo.com"]');
    }

    get inputPassword () {
        return $('input[placeholder="Ingresa tu contraseña"]');
    }

    get btnSubmit () {
        return $('button=Ingresar al Sistema');
    }

    get linkRegistro () {
        return $('button=Crear cuenta nueva');
    }

    get linkForgotPassword () {
        return $('button=Olvidé mi contraseña');
    }

    get linkCatalogo () {
        return $('button=Ver catálogo sin iniciar sesión');
    }

    get btnMostrarPassword () {
        // Seleccionamos el botón dentro del div relativo del input password
        return this.inputPassword.nextElement();
    }

    get toastMessage () {
        return $('div[role="alert"] .toast-body, div[style*="position: fixed"]');
    }

    /**
     * Métodos para encapsular el código de automatización de interacciones
     */
    async login (username, password) {
        await this.inputUsername.setValue(username);
        await this.inputPassword.setValue(password);
        await this.btnSubmit.click();
    }

    open () {
        return browser.url('/');
    }
}

module.exports = new LoginPage();
