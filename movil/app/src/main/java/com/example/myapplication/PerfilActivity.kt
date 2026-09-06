package com.example.myapplication

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.ChangePasswordRequest
import com.example.myapplication.model.Cliente
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class PerfilActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var userId: String
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    private lateinit var etNombre:    EditText
    private lateinit var etFechaNacimiento: EditText
    private lateinit var etCorreo:    EditText
    private lateinit var etTelefono:  EditText
    private lateinit var etDireccion: EditText
    private lateinit var tvInicial:   TextView

    private var fechaNacimientoOriginal: String = ""
    private var codigoDocumentoOriginal: Int = 1
    private var codigoRolOriginal: Int = 2

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_perfil)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token  = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userId = prefs.getString("user_id", "") ?: ""

        etNombre    = findViewById(R.id.etNombrePerfil)
        etFechaNacimiento = findViewById(R.id.etFechaNacimientoPerfil)
        etCorreo    = findViewById(R.id.etCorreoPerfil)
        etTelefono  = findViewById(R.id.etTelefonoPerfil)
        etDireccion = findViewById(R.id.etDireccionPerfil)
        tvInicial   = findViewById(R.id.tvInicialPerfil)

        cargarPerfil()

        findViewById<Button>(R.id.btnGuardarPerfil).setOnClickListener { guardarPerfil() }
        findViewById<Button>(R.id.btnCambiarPassword).setOnClickListener { cambiarPassword() }
        findViewById<Button>(R.id.btnRegresarPerfil).setOnClickListener { finish() }
    }

    private fun cargarPerfil() {
        if (userId.isEmpty()) return
        api.getPerfil(token, userId).enqueue(object : Callback<Cliente> {
            override fun onResponse(call: Call<Cliente>, response: Response<Cliente>) {
                if (response.isSuccessful && response.body() != null) {
                    val c = response.body()!!
                    etNombre.setText(c.nombre)
                    etFechaNacimiento.setText(c.fechaNacimiento?.take(10) ?: "")
                    etCorreo.setText(c.correo)
                    etTelefono.setText(c.telefono)
                    etDireccion.setText(c.direccion)
                    fechaNacimientoOriginal = c.fechaNacimiento ?: ""
                    codigoDocumentoOriginal = c.codigoDocumento
                    codigoRolOriginal = c.codigoRol
                    // Mostrar inicial del nombre
                    tvInicial.text = c.nombre.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
                }
            }
            override fun onFailure(call: Call<Cliente>, t: Throwable) {
                Toast.makeText(this@PerfilActivity, "Error cargando perfil: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun guardarPerfil() {
        val nombre    = etNombre.text.toString().trim()
        val fechaNacimiento = etFechaNacimiento.text.toString().trim()
        val correo    = etCorreo.text.toString().trim()
        val telefono  = etTelefono.text.toString().trim()
        val direccion = etDireccion.text.toString().trim()

        if (nombre.isEmpty()) {
            etNombre.error = "El nombre es obligatorio"
            return
        }
        val palabrasNombre = nombre.split("\\s+".toRegex()).filter { it.length >= 2 }
        if (palabrasNombre.size < 2) {
            etNombre.error = "Ingresa mínimo 1 nombre y 1 apellido"
            return
        }
        if (!nombre.matches("^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\\s\\-']+$".toRegex())) {
            etNombre.error = "Solo letras permitidas"
            return
        }

        if (correo.isEmpty() || !correo.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$".toRegex())) {
            etCorreo.error = "Correo electrónico no válido"
            return
        }

        if (telefono.isEmpty()) {
            etTelefono.error = "El teléfono es obligatorio"
            return
        }
        if (!telefono.matches("^\\d+$".toRegex())) { etTelefono.error = "Solo números"; return }
        if (telefono.length != 7 && telefono.length != 10) { etTelefono.error = "Debe tener 7 o 10 dígitos"; return }
        if (telefono.length == 10 && !telefono.startsWith("3")) { etTelefono.error = "Celulares deben iniciar con 3"; return }

        if (direccion.isNotEmpty()) {
            if (direccion.length < 8) { etDireccion.error = "Mínimo 8 caracteres"; return }
            if (!direccion.matches(".*[A-Za-zÁÉÍÓÚáéíóúÑñ].*".toRegex())) { etDireccion.error = "Debe contener texto"; return }
            if (!direccion.matches(".*\\d.*".toRegex())) { etDireccion.error = "Debe contener al menos un número"; return }
        }


        val clienteActualizado = Cliente(
            idUsuario       = userId,
            codigoDocumento = codigoDocumentoOriginal,
            nombre          = nombre,
            fechaNacimiento = fechaNacimiento.ifEmpty { fechaNacimientoOriginal },
            direccion       = direccion,
            telefono        = telefono,
            correo          = correo,
            clave           = "",
            codigoRol       = codigoRolOriginal
        )

        api.actualizarMiPerfil(token, clienteActualizado).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@PerfilActivity, "Perfil actualizado correctamente", Toast.LENGTH_SHORT).show()
                    tvInicial.text = nombre.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
                } else {
                    Toast.makeText(this@PerfilActivity, "Error ${response.code()}: No se pudo actualizar", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@PerfilActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun cambiarPassword() {
        val etOldPass     = findViewById<EditText>(R.id.etOldPassword)
        val etNewPass     = findViewById<EditText>(R.id.etNewPassword)
        val etConfirmPass = findViewById<EditText>(R.id.etConfirmPassword)
        
        val oldPass     = etOldPass.text.toString()
        val newPass     = etNewPass.text.toString()
        val confirmPass = etConfirmPass.text.toString()

        if (oldPass.isEmpty()) { etOldPass.error = "Requerido"; return }
        if (newPass.isEmpty()) { etNewPass.error = "Requerido"; return }
        if (confirmPass.isEmpty()) { etConfirmPass.error = "Requerido"; return }

        if (newPass != confirmPass) {
            etConfirmPass.error = "Las contraseñas no coinciden"
            return
        }
        if (newPass.length < 6 || newPass.length > 15) {
            etNewPass.error = "Debe tener entre 6 y 15 caracteres"
            return
        }

        api.changePassword(token, ChangePasswordRequest(oldPass, newPass)).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@PerfilActivity, "Contraseña cambiada exitosamente", Toast.LENGTH_SHORT).show()
                    etOldPass.text.clear()
                    etNewPass.text.clear()
                    etConfirmPass.text.clear()
                } else {
                    etOldPass.error = "Contraseña actual incorrecta"
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@PerfilActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
