package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import androidx.appcompat.app.AppCompatActivity

class MenuActivity : AppCompatActivity() {

    private lateinit var btnCerrarSesion: Button
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.main_menu)
        val btnCliente = findViewById<ImageButton>(R.id.btnCliente)
        val btnServicio = findViewById<ImageButton>(R.id.btnServicio)
        val btnCompras = findViewById<ImageButton>(R.id.btnCompras)
        btnCerrarSesion = findViewById(R.id.btnCerrarSesion)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val userRole = sharedPref.getInt("user_role", 2)

        btnCliente.setOnClickListener {
            val intent = Intent(this, ClienteActivity::class.java)
            startActivity(intent)
        }
        btnServicio.setOnClickListener {
            val intent = if (userRole == 2) {
                Intent(this, SolicitarServicioActivity::class.java)
            } else {
                Intent(this, ServicioActivity::class.java)
            }
            startActivity(intent)
        }
        btnCompras.setOnClickListener {
            val intent = if (userRole == 2) {
                Intent(this, CatalogoActivity::class.java)
            } else {
                Intent(this, ProductoActivity::class.java)
            }
            startActivity(intent)
        }
        btnCerrarSesion.setOnClickListener {
            val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
            sharedPref.edit().clear().apply()

            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK

            startActivity(intent)
            finish()
        }
    }
}