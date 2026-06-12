package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MenuActivity : AppCompatActivity() {

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }
    private lateinit var token: String
    private lateinit var tvBadge: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.main_menu)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw  = prefs.getString("token", "") ?: ""
        token    = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        val userRole = prefs.getInt("user_role", 2)

        // Referencias a botones
        val btnCliente    = findViewById<ImageButton>(R.id.btnCliente)
        val btnServicio   = findViewById<ImageButton>(R.id.btnServicio)
        val btnCompras    = findViewById<ImageButton>(R.id.btnCompras)
        val btnGear       = findViewById<ImageButton>(R.id.btnGear)         // Notificaciones
        val btnChat       = findViewById<ImageButton>(R.id.btnChat)         // Chat  — NUEVO
        val btnPerfil     = findViewById<ImageButton>(R.id.btnPerfil)       // Perfil — NUEVO
        val btnCerrarSesion = findViewById<Button>(R.id.btnCerrarSesion)
        tvBadge           = findViewById(R.id.tvBadgeMenu)

        // Ocultar "Usuarios" si no es admin (rol 3)
        if (userRole != 3) {
            btnCliente.visibility = View.GONE
        }

        // ── Acciones ──────────────────────────────────────────────────────────

        btnCliente.setOnClickListener {
            startActivity(Intent(this, ClienteActivity::class.java))
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

        // Notificaciones — estaba desconectado, ahora conectado
        btnGear.setOnClickListener {
            startActivity(Intent(this, NotificacionActivity::class.java))
        }

        // Chat — botón nuevo
        btnChat.setOnClickListener {
            startActivity(Intent(this, ChatListActivity::class.java))
        }

        // Perfil — botón nuevo
        btnPerfil.setOnClickListener {
            startActivity(Intent(this, PerfilActivity::class.java))
        }

        // Cerrar sesión
        btnCerrarSesion.setOnClickListener {
            prefs.edit().clear().apply()
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        // Actualizar badge de notificaciones no leídas cada vez que se vuelve al menú
        actualizarBadge()
    }

    private fun actualizarBadge() {
        api.getConteoNoLeidas(token).enqueue(object : Callback<Map<String, Int>> {
            override fun onResponse(call: Call<Map<String, Int>>, response: Response<Map<String, Int>>) {
                if (response.isSuccessful && response.body() != null) {
                    val conteo = response.body()!!["count"] ?: 0
                    if (conteo > 0) {
                        tvBadge.text       = conteo.toString()
                        tvBadge.visibility = View.VISIBLE
                    } else {
                        tvBadge.visibility = View.GONE
                    }
                }
            }
            override fun onFailure(call: Call<Map<String, Int>>, t: Throwable) {
                // Silencioso — no interrumpir la experiencia del menú
            }
        })
    }
}