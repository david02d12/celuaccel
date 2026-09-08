package com.example.myapplication

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Cliente
import com.example.myapplication.model.TipoDocumento
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegistroActivity : AppCompatActivity() {

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }
    private var tiposDocumento: List<TipoDocumento> = emptyList()
    private lateinit var tvMensaje: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_registro)


        val spinnerTipo  = findViewById<Spinner>(R.id.spinnerTipoDoc)
        val etDocumento  = findViewById<EditText>(R.id.etDocumento)
        val etNombre     = findViewById<EditText>(R.id.etNombre)
        val etFechaNacimiento = findViewById<EditText>(R.id.etFechaNacimiento)
        val etDireccion  = findViewById<EditText>(R.id.etDireccion)
        val etTelefono   = findViewById<EditText>(R.id.etTelefono)
        val etCorreo     = findViewById<EditText>(R.id.etCorreo)
        val etClave      = findViewById<EditText>(R.id.etPassword)
        val etConfirmClave = findViewById<EditText>(R.id.etConfirmPassword)
        val btnRegistrar = findViewById<Button>(R.id.btnRegistrar)
        val tvVolver     = findViewById<TextView>(R.id.tvVolverLogin)
        tvMensaje        = findViewById(R.id.tvMsgRegistro)


        val tiposLocales = listOf(
            TipoDocumento(1, "Cédula de Ciudadanía"),
            TipoDocumento(2, "Tarjeta de Identidad"),
            TipoDocumento(3, "Cédula de Extranjería"),
            TipoDocumento(4, "Pasaporte"),
            TipoDocumento(5, "PEP")
        )
        tiposDocumento = tiposLocales
        val nombresSpinner = tiposLocales.map { it.nombreDocumento }
        val spinnerAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, nombresSpinner)
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerTipo.adapter = spinnerAdapter

        btnRegistrar.setOnClickListener {
            val documento = etDocumento.text.toString().trim()
            val tipoIdx   = spinnerTipo.selectedItemPosition
            val nombre    = etNombre.text.toString().trim()
            val fechaNacimiento = etFechaNacimiento.text.toString().trim()
            val direccion = etDireccion.text.toString().trim()
            val telefono  = etTelefono.text.toString().trim()
            val correo    = etCorreo.text.toString().trim()
            val clave     = etClave.text.toString()
            val confirmClave = etConfirmClave.text.toString()

            // --- VALIDACIONES DE TIPO DE DOCUMENTO ---
            val codigoDocumento = tiposDocumento.getOrNull(tipoIdx)?.codigoDocumento ?: 1
            if (documento.isEmpty()) { etDocumento.error = "Requerido"; return@setOnClickListener }
            when (codigoDocumento) {
                1 -> if (!documento.matches("^\\d{6,10}$".toRegex())) { etDocumento.error = "Cédula: 6-10 números"; return@setOnClickListener }
                3 -> if (!documento.matches("^[A-Za-z0-9]{6,12}$".toRegex())) { etDocumento.error = "C.E: 6-12 caracteres"; return@setOnClickListener }
                4 -> if (!documento.matches("^[A-Za-z0-9]{5,15}$".toRegex())) { etDocumento.error = "Pasaporte: 5-15 caracteres"; return@setOnClickListener }
                5 -> if (!documento.matches("^[A-Za-z0-9]{15,17}$".toRegex())) { etDocumento.error = "PEP: 15-17 caracteres"; return@setOnClickListener }
            }

            // --- VALIDACIONES DE NOMBRE COMPLETO ---
            if (nombre.isEmpty()) { etNombre.error = "Requerido"; return@setOnClickListener }
            if (!nombre.matches("^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\\s\\-']+$".toRegex())) {
                etNombre.error = "Solo letras, espacios y guiones"
                return@setOnClickListener
            }
            val palabrasNombre = nombre.split("\\s+".toRegex()).filter { it.length >= 2 }
            if (palabrasNombre.size < 2) {
                etNombre.error = "Ingresa mínimo 1 nombre y 1 apellido"
                return@setOnClickListener
            }
            if (palabrasNombre.size > 5) {
                etNombre.error = "Demasiados nombres/apellidos"
                return@setOnClickListener
            }

            // --- VALIDACIONES DE FECHA DE NACIMIENTO ---
            if (fechaNacimiento.isEmpty()) {
                etFechaNacimiento.error = "Requerido"
                return@setOnClickListener
            }
            try {
                // Asumiendo formato YYYY-MM-DD
                val parts = fechaNacimiento.split("-")
                if (parts.size == 3) {
                    val cal = java.util.Calendar.getInstance()
                    val yearAct = cal.get(java.util.Calendar.YEAR)
                    val monthAct = cal.get(java.util.Calendar.MONTH) + 1
                    val dayAct = cal.get(java.util.Calendar.DAY_OF_MONTH)
                    
                    val yearNac = parts[0].toInt()
                    val monthNac = parts[1].toInt()
                    val dayNac = parts[2].toInt()
                    
                    var edad = yearAct - yearNac
                    if (monthAct < monthNac || (monthAct == monthNac && dayAct < dayNac)) { edad-- }
                    
                    if (edad < 18) { etFechaNacimiento.error = "Debes ser mayor de 18 años"; return@setOnClickListener }
                    if (edad > 80) { etFechaNacimiento.error = "Edad máxima 80 años"; return@setOnClickListener }
                }
            } catch (e: Exception) {
                etFechaNacimiento.error = "Formato inválido (YYYY-MM-DD)"
                return@setOnClickListener
            }

            // --- VALIDACIONES DE DIRECCIÓN (Opcional) ---
            if (direccion.isNotEmpty()) {
                if (direccion.length < 8) { etDireccion.error = "Mínimo 8 caracteres"; return@setOnClickListener }
                if (!direccion.matches(".*[A-Za-zÁÉÍÓÚáéíóúÑñ].*".toRegex())) { etDireccion.error = "Debe contener texto"; return@setOnClickListener }
                if (!direccion.matches(".*\\d.*".toRegex())) { etDireccion.error = "Debe contener al menos un número"; return@setOnClickListener }
            }

            // --- VALIDACIONES DE TELÉFONO ---
            if (telefono.isEmpty()) { etTelefono.error = "Requerido"; return@setOnClickListener }
            if (!telefono.matches("^3\\d{9}$".toRegex())) {
                etTelefono.error = "Celular inválido (10 dígitos, empieza en 3)"
                return@setOnClickListener
            }

            // --- VALIDACIONES DE CORREO ---
            if (correo.isEmpty()) { etCorreo.error = "Requerido"; return@setOnClickListener }
            if (correo.count { it == '@' } != 1) { etCorreo.error = "Debe contener exactamente un @"; return@setOnClickListener }
            if (!correo.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$".toRegex())) {
                etCorreo.error = "Correo inválido"
                return@setOnClickListener
            }

            // --- VALIDACIONES DE CONTRASEÑA ---
            if (clave.length < 6 || clave.length > 64) { 
                etClave.error = "Debe tener entre 6 y 64 caracteres"
                return@setOnClickListener 
            }
            if (clave != confirmClave) { 
                etConfirmClave.error = "Las contraseñas no coinciden"
                return@setOnClickListener 
            }

            mostrarMensaje("Creando cuenta...", Color.BLUE)

            val nuevoCliente = Cliente(
                idUsuario       = documento,
                codigoDocumento = codigoDocumento,
                nombre          = nombre,
                fechaNacimiento = fechaNacimiento.ifEmpty { "2000-01-01" },
                direccion       = direccion.ifEmpty { "" },
                telefono        = telefono.ifEmpty { "" },
                correo          = correo,
                clave           = clave,
                codigoRol       = 2
            )

            api.createCliente(nuevoCliente).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        mostrarMensaje("¡Registro exitoso! Ya puedes iniciar sesión.", Color.parseColor("#2E7D32"))
                        btnRegistrar.postDelayed({
                            val intent = Intent(this@RegistroActivity, LoginActivity::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                            startActivity(intent)
                            finish()
                        }, 2000)
                    } else {
                        val msg = when (response.code()) {
                            409  -> "Este documento ya está registrado."
                            400  -> "Datos inválidos. Verifica los campos."
                            else -> "Error al registrar (${response.code()})."
                        }
                        mostrarMensaje(msg, Color.RED)
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    mostrarMensaje("Error de conexión. Verifica tu internet.", Color.RED)
                }
            })
        }


        tvVolver.setOnClickListener { finish() }
    }

    private fun mostrarMensaje(msg: String, color: Int) {
        tvMensaje.text       = msg
        tvMensaje.setTextColor(color)
        tvMensaje.visibility = View.VISIBLE
    }
}
