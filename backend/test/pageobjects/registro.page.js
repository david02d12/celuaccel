class RegistroPage {
    /**
     * Define selectores usando getter methods
     */
    get inputIdUsuario () {
        return $('input[placeholder*="Ej: 1001234567"]');
    }

    get selectTipoDocumento () {
        return $('select.form-select');
    }

    get inputNombre () {
        return $('input[placeholder="Ej: Juan Pérez"]');
    }

    get inputCorreo () {
        return $('input[placeholder="ejemplo@correo.com"]');
    }

    get inputClave () {
        return $('input[placeholder="Mínimo 6 caracteres"]');
    }

    get inputFechaNacimiento () {
        return $('input[type="date"]');
    }

    get inputDireccion () {
        return $('input[placeholder="Ej: Calle 45 #12-30"]');
    }

    get inputTelefono () {
        return $('input[placeholder="Ej: 3001234567"]');
    }

    get btnSubmit () {
        return $('button*=Crear Cuenta');
    }

    get linkLogin () {
        return $('button=Inicia Sesión');
    }

    get toastMessage () {
        return $('div.toast-body');
    }

    /**
     * Método para registrar un usuario
     */
    async registrar (idUsuario, tipoDocumento, nombre, correo, clave, telefono = '') {
        await this.inputIdUsuario.setValue(idUsuario);
        await this.selectTipoDocumento.selectByAttribute('value', tipoDocumento);
        await this.inputNombre.setValue(nombre);
        await this.inputCorreo.setValue(correo);
        await this.inputClave.setValue(clave);
        if (telefono) {
            await this.inputTelefono.setValue(telefono);
        }
        await this.btnSubmit.click();
    }
}

module.exports = new RegistroPage();
