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

    private var resetToken: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reset_password)

        // Manejar Deep Link (cuando la app se abre desde el navegador o correo)
        handleIntent(intent)

        val etNewPassword    = findViewById<EditText>(R.id.etNewPass)
        val etConfirmPassword = findViewById<EditText>(R.id.etConfirmPass)
        val btnResetPassword  = findViewById<Button>(R.id.btnResetear)

        btnResetPassword.setOnClickListener {
            val newPass = etNewPassword.text.toString()
            val confirmPass = etConfirmPassword.text.toString()

            if (newPass.isEmpty()) { etNewPassword.error = "Requerido"; return@setOnClickListener }
            if (confirmPass.isEmpty()) { etConfirmPassword.error = "Requerido"; return@setOnClickListener }

            if (newPass != confirmPass) {
                etConfirmPassword.error = "Las contraseñas no coinciden"
                return@setOnClickListener
            }
            if (newPass.length < 6) {
                etNewPassword.error = "Mínimo 6 caracteres"
                return@setOnClickListener
            }

            if (resetToken.isNullOrEmpty()) {
                Toast.makeText(this, "Enlace inválido o sin token de recuperación", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val api = ApiClient.retrofit.create(ApiService::class.java)
            val request = ResetPasswordRequest(token = resetToken!!, newPassword = newPass)

            api.resetPassword(request).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ResetPasswordActivity, "Contraseña restablecida con éxito. Inicia sesión.", Toast.LENGTH_LONG).show()
                        val intentLogin = Intent(this@ResetPasswordActivity, LoginActivity::class.java)
                        intentLogin.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intentLogin)
                        finish()
                    } else {
                        Toast.makeText(this@ResetPasswordActivity, "Error: El enlace de recuperación es inválido o ha expirado.", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ResetPasswordActivity, "Error de red al intentar restablecer contraseña", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val action: String? = intent?.action
        val data: Uri? = intent?.data

        if (Intent.ACTION_VIEW == action && data != null) {
            // Ejemplo URL: http://localhost:5173/?token=eyJhbGciOiJIUz...
            val token = data.getQueryParameter("token")
            if (token != null) {
                resetToken = token
            }
        }
    }
}
