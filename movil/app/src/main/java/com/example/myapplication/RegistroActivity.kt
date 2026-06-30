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
        val etDireccion  = findViewById<EditText>(R.id.etDireccion)
        val etTelefono   = findViewById<EditText>(R.id.etTelefono)
        val etCorreo     = findViewById<EditText>(R.id.etCorreo)
        val etClave      = findViewById<EditText>(R.id.etPassword)
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
            val direccion = etDireccion.text.toString().trim()
            val telefono  = etTelefono.text.toString().trim()
            val correo    = etCorreo.text.toString().trim()
            val clave     = etClave.text.toString()

            // Validaciones
            if (documento.isEmpty()) { etDocumento.error = "Requerido"; return@setOnClickListener }
            if (nombre.isEmpty())    { etNombre.error    = "Requerido"; return@setOnClickListener }
            if (correo.isEmpty())    { etCorreo.error    = "Requerido"; return@setOnClickListener }
            if (clave.length < 6)   { etClave.error     = "Mínimo 6 caracteres"; return@setOnClickListener }

            val codigoDocumento = tiposDocumento.getOrNull(tipoIdx)?.codigoDocumento ?: 1

            mostrarMensaje("Creando cuenta...", Color.BLUE)

            val nuevoCliente = Cliente(
                idUsuario       = documento,
                codigoDocumento = codigoDocumento,
                nombre          = nombre,
                fechaNacimiento = "2000-01-01",
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
