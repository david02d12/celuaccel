class DashboardPage {
    /**
     * Componentes del Layout Base post-login (Sidebar/Navbar)
     */
    get navTitle () {
        return $('span*=CELUACCEL');
    }

    get btnPerfil () {
        return $('button*=Perfil');
    }

    get btnCerrarSesion () {
        return $('button*=Cerrar Sesión'); // O botón con icono de logout
    }

    get menuLateral () {
        return $$('aside button, aside a'); // Elementos del menú en la barra lateral
    }

    // --- Módulo Cliente ---
    get linkMiServicio () { return $('button*=Mi Servicio'); }
    get linkMisPreguntas () { return $('button*=Mis Preguntas'); }

    // --- Módulo Técnico / Administrador ---
    get linkServicios () { return $('button*=Servicios'); }
    get linkProductos () { return $('button*=Productos'); }
    get linkCategorias () { return $('button*=Categorías'); }
    get linkHistorial () { return $('button*=Historial'); }

    // --- Módulo Administrador Exclusivo ---
    get linkUsuarios () { return $('button*=Usuarios'); }
    get linkRoles () { return $('button*=Roles'); }
    get linkTipoDoc () { return $('button*=Tipos de Documento'); }

    /**
     * Métodos comunes post-login
     */
    async navegarA (nombreOpcion) {
        const opcion = await $(`button*=${nombreOpcion}`);
        if(await opcion.isExisting()) {
            await opcion.click();
        } else {
            // Fallback: buscar enlaces o span
            const altOpcion = await $(`span*=${nombreOpcion}`);
            await altOpcion.click();
        }
    }

    async cerrarSesion () {
        const logoutBtn = await this.btnCerrarSesion;
        if(await logoutBtn.isExisting()){
            await logoutBtn.click();
        } else {
            // Cerrar sesión que quizás está en el perfil o navbar derecho
            const iconLogout = await $('svg'); // Selectores muy genéricos, ajustaremos si fallan
            await iconLogout.click();
        }
    }
}

module.exports = new DashboardPage();
