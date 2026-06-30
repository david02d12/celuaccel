package com.example.myapplication

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.ResetPasswordRequest
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ResetPasswordActivity : AppCompatActivity() {

    // Token extraído del Deep Link: celuaccel://reset-password?token=TOKEN
    private var resetToken: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reset_password)

        // 1. Intentar capturar el token del Deep Link al crear la Activity
        extractTokenFromIntent(intent)

        val etNewPassword     = findViewById<EditText>(R.id.etNewPass)
        val etConfirmPassword = findViewById<EditText>(R.id.etConfirmPass)
        val btnResetPassword  = findViewById<Button>(R.id.btnResetear)

        // 2. Si no hay token, avisar inmediatamente y no dejar continuar
        if (resetToken.isNullOrEmpty()) {
            Toast.makeText(
                this,
                "Enlace de recuperación inválido. Solicita uno nuevo desde la pantalla de login.",
                Toast.LENGTH_LONG
            ).show()
            btnResetPassword.isEnabled = false
        }

        btnResetPassword.setOnClickListener {
            val newPass     = etNewPassword.text.toString()
            val confirmPass = etConfirmPassword.text.toString()

            if (newPass.isEmpty())    { etNewPassword.error    = "Requerido"; return@setOnClickListener }
            if (confirmPass.isEmpty()) { etConfirmPassword.error = "Requerido"; return@setOnClickListener }
            if (newPass != confirmPass) {
                etConfirmPassword.error = "Las contraseñas no coinciden"
                return@setOnClickListener
            }
            if (newPass.length < 6) {
                etNewPassword.error = "Mínimo 6 caracteres"
                return@setOnClickListener
            }

            val api     = ApiClient.retrofit.create(ApiService::class.java)
            // token → URL path (/reset-password/{token}) | newPassword → body
            val request = ResetPasswordRequest(newPassword = newPass)

            btnResetPassword.isEnabled = false

            api.resetPassword(resetToken!!, request).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@ResetPasswordActivity,
                            "✅ Contraseña restablecida. Inicia sesión con tu nueva clave.",
                            Toast.LENGTH_LONG
                        ).show()
                        val intentLogin = Intent(this@ResetPasswordActivity, LoginActivity::class.java)
                        intentLogin.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intentLogin)
                        finish()
                    } else {
                        btnResetPassword.isEnabled = true
                        Toast.makeText(
                            this@ResetPasswordActivity,
                            "❌ Enlace inválido o expirado. Solicita un nuevo correo de recuperación.",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    btnResetPassword.isEnabled = true
                    Toast.makeText(
                        this@ResetPasswordActivity,
                        "Sin conexión. Verifica tu red e intenta de nuevo.",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            })
        }
    }

    /**
     * Se llama también cuando la Activity ya existe en backstack y llega un nuevo Intent
     * (caso en que el usuario toca el link desde el correo con la app ya abierta).
     */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        extractTokenFromIntent(intent)
    }

    /**
     * Extrae el token del Deep Link con Custom Scheme:
     *   celuaccel://reset-password?token=TOKEN_AQUI
     *
     * data.scheme  → "celuaccel"
     * data.host    → "reset-password"
     * data.getQueryParameter("token") → el JWT / token del backend
     */
    private fun extractTokenFromIntent(intent: Intent?) {
        val data: Uri? = intent?.data

        if (intent?.action == Intent.ACTION_VIEW && data != null) {
            // Validar que el scheme y host coincidan con nuestro Custom Scheme registrado
            if (data.scheme == "celuaccel" && data.host == "reset-password") {
                val token = data.getQueryParameter("token")
                if (!token.isNullOrEmpty()) {
                    resetToken = token
                    // Re-habilitar el botón por si se recibió un nuevo token
                    findViewById<Button>(R.id.btnResetear)?.isEnabled = true
                }
            }
        }
    }
}
