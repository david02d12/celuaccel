package com.example.myapplication

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
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
        val etPassword = findViewById<EditText>(R.id.clave)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val tvMessage = findViewById<TextView>(R.id.textView)

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
                tvMessage.setTextColor(Color.BLUE)
                tvMessage.text = "Validando credenciales..."
                realizarLogin(documento, clave, tvMessage)
            }
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
                        putInt("user_role", loginResponse?.role ?: 2)
                    }.apply()

                    tvMessage.setTextColor(Color.GREEN)
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
        view.setTextColor(Color.RED)
        view.text = mensaje
    }

    private fun irAlMenu() {
        val intent = Intent(this@LoginActivity, MenuActivity::class.java)
        startActivity(intent)
        finish()
    }
}