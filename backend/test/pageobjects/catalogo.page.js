class CatalogoPublicoPage {
    /**
     * Define selectores principales
     */
    get tituloCatalogo () {
        return $('h1=Catalogo de Productos');
    }

    get btnIniciarSesionNav () {
        return $('button=Iniciar Sesion');
    }

    get btnRegistrarseNav () {
        return $('button=Registrarse');
    }

    get inputBusqueda () {
        return $('input[placeholder="Buscar por nombre, modelo..."]'); // Selector genérico basado en componentes comunes
    }

    get selectCategoria () {
        return $('select'); // Primer select en la vista
    }

    get tarjetasProducto () {
        return $$('.card'); // Asumiendo que usa class="card"
    }

    get btnVerDetalles () {
        return $$('button*=Ver Detalles');
    }

    open () {
        return browser.url('/');
    }
}

module.exports = new CatalogoPublicoPage();
