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
    private lateinit var etCorreo:    EditText
    private lateinit var etTelefono:  EditText
    private lateinit var etDireccion: EditText
    private lateinit var tvInicial:   TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_perfil)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token  = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userId = prefs.getString("user_id", "") ?: ""

        etNombre    = findViewById(R.id.etNombrePerfil)
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
                    etCorreo.setText(c.correo)
                    etTelefono.setText(c.telefono)
                    etDireccion.setText(c.direccion)
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
        val correo    = etCorreo.text.toString().trim()
        val telefono  = etTelefono.text.toString().trim()
        val direccion = etDireccion.text.toString().trim()

        if (nombre.isEmpty() || correo.isEmpty()) {
            Toast.makeText(this, "Nombre y correo son obligatorios", Toast.LENGTH_SHORT).show()
            return
        }

        // Construimos el cliente con los datos actualizados (campos requeridos por el modelo)
        val clienteActualizado = Cliente(
            idUsuario       = userId,
            codigoDocumento = 0,     // se mantiene el original (no se edita aquí)
            nombre          = nombre,
            fechaNacimiento = "",
            direccion       = direccion,
            telefono        = telefono,
            correo          = correo,
            clave           = "",    // no se envía en actualización de perfil
            codigoRol       = 0
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
        val oldPass     = findViewById<EditText>(R.id.etOldPassword).text.toString()
        val newPass     = findViewById<EditText>(R.id.etNewPassword).text.toString()
        val confirmPass = findViewById<EditText>(R.id.etConfirmPassword).text.toString()

        if (oldPass.isEmpty() || newPass.isEmpty() || confirmPass.isEmpty()) {
            Toast.makeText(this, "Completa todos los campos de contraseña", Toast.LENGTH_SHORT).show()
            return
        }
        if (newPass != confirmPass) {
            Toast.makeText(this, "Las contraseñas nuevas no coinciden", Toast.LENGTH_SHORT).show()
            return
        }
        if (newPass.length < 6) {
            Toast.makeText(this, "La nueva contraseña debe tener al menos 6 caracteres", Toast.LENGTH_SHORT).show()
            return
        }

        api.changePassword(token, ChangePasswordRequest(oldPass, newPass)).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@PerfilActivity, "Contraseña cambiada exitosamente", Toast.LENGTH_SHORT).show()
                    findViewById<EditText>(R.id.etOldPassword).text.clear()
                    findViewById<EditText>(R.id.etNewPassword).text.clear()
                    findViewById<EditText>(R.id.etConfirmPassword).text.clear()
                } else {
                    Toast.makeText(this@PerfilActivity, "Error: contraseña actual incorrecta", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@PerfilActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
