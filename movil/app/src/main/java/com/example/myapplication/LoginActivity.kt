package com.example.myapplication

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.ForgotPasswordRequest
import com.example.myapplication.model.LoginRequest
import com.example.myapplication.model.LoginResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)


        val etDocumento = findViewById<EditText>(R.id.id_Usuario)
        val etPassword  = findViewById<EditText>(R.id.clave)
        val btnLogin    = findViewById<Button>(R.id.btnLogin)
        val tvMessage   = findViewById<TextView>(R.id.tvMessage)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        if (sharedPref.contains("token")) {
            irAlMenu()
        }

        btnLogin.setOnClickListener {
            val documento = etDocumento.text.toString().trim()
            val clave = etPassword.text.toString()

            if (documento.isEmpty() || clave.isEmpty()) {
                mostrarError(tvMessage, "Por favor, complete todos los campos")
            } else {
                tvMessage.visibility = android.view.View.VISIBLE
                tvMessage.setTextColor(androidx.core.content.ContextCompat.getColor(this, R.color.celuaccel_primary))
                tvMessage.text = "Validando credenciales..."
                realizarLogin(documento, clave, tvMessage)
            }
        }


        // ── Recuperar contraseña (visible y accesible) ──────────────────────
        val tvOlvideContrasena = findViewById<TextView>(R.id.tvOlvideContrasena)
        tvOlvideContrasena.setOnClickListener {
            mostrarDialogoRecuperacion()
        }


        val tvCrearCuenta = findViewById<TextView?>(R.id.tvCrearCuenta)
        tvCrearCuenta?.setOnClickListener {
            startActivity(Intent(this, RegistroActivity::class.java))
        }


        val btnCatalogoPublico = findViewById<Button?>(R.id.btnCatalogoPublico)
        btnCatalogoPublico?.setOnClickListener {
            val intent = Intent(this, CatalogoActivity::class.java)
            intent.putExtra("IS_PUBLIC", true)
            startActivity(intent)
        }
    }


    private fun realizarLogin(documento: String, pass: String, tvMessage: TextView) {
        val api = ApiClient.retrofit.create(ApiService::class.java)


        val request = LoginRequest(user = documento, password = pass)

        api.login(request).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful && response.body() != null) {
                    val loginResponse = response.body()
                    val token = loginResponse?.token


                    val prefs = getSharedPreferences("app", MODE_PRIVATE)
                    prefs.edit().apply {
                        putString("token", token)
                        putString("user_id", loginResponse?.user)
                        putString("user_name", loginResponse?.nombre ?: loginResponse?.user)
                        putInt("user_role", loginResponse?.role ?: 2)
                    }.apply()

                    tvMessage.visibility = android.view.View.VISIBLE
                    tvMessage.setTextColor(androidx.core.content.ContextCompat.getColor(this@LoginActivity, R.color.etapa_listo_border))
                    tvMessage.text = "Ingreso con éxito"

                    irAlMenu()
                } else {

                    val codigoError = response.code()
                    val cuerpoError = response.errorBody()?.string()

                    mostrarError(tvMessage, "Error: $codigoError | Resp: $cuerpoError")
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {

                mostrarError(tvMessage, "Error de red: No se pudo conectar al servidor")
                t.printStackTrace()
            }
        })
    }


    private fun mostrarError(view: TextView, mensaje: String) {
        view.visibility = android.view.View.VISIBLE
        view.setTextColor(Color.RED)
        view.text = mensaje
    }

    private fun irAlMenu() {
        val intent = Intent(this@LoginActivity, MenuActivity::class.java)
        startActivity(intent)
        finish()
    }

    /**
     * Muestra el diálogo de recuperación de contraseña.
     * El backend recibirá el email y enviará un link con Custom Scheme:
     *   celuaccel://reset-password?token=TOKEN
     */
    private fun mostrarDialogoRecuperacion() {
        val input = EditText(this).apply {
            hint = "usuario@correo.com"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or
                        android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
        }

        AlertDialog.Builder(this)
            .setTitle("Recuperar Contraseña")
            .setMessage("Ingresa el correo electrónico de tu cuenta y te enviaremos un enlace para restablecer tu contraseña.")
            .setView(input)
            .setPositiveButton("Enviar enlace") { _, _ ->
                val email = input.text.toString().trim()
                if (email.isEmpty()) {
                    Toast.makeText(this, "El correo no puede estar vacío", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                    Toast.makeText(this, "Ingresa un correo válido", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val api = ApiClient.retrofit.create(ApiService::class.java)
                api.forgotPassword(ForgotPasswordRequest(email)).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            Toast.makeText(
                                this@LoginActivity,
                                "✅ Correo enviado. Revisa tu bandeja y toca el enlace desde tu celular.",
                                Toast.LENGTH_LONG
                            ).show()
                        } else {
                            Toast.makeText(
                                this@LoginActivity,
                                "No encontramos una cuenta con ese correo. Verifica e intenta de nuevo.",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        Toast.makeText(this@LoginActivity, "Sin conexión. Verifica tu red.", Toast.LENGTH_LONG).show()
                    }
                })
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}