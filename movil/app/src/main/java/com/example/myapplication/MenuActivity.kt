package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.LinearLayout
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

        // ── Preferencias compartidas y Token ──────────────────────────────────
        val prefs    = getSharedPreferences("app", MODE_PRIVATE)
        val raw      = prefs.getString("token", "") ?: ""
        token        = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        val userRole = prefs.getInt("user_role", 2)
        val userName = prefs.getString("user_name", prefs.getString("user_id", "Usuario")) ?: "Usuario"

        // Header: saludo con nombre
        val tvTitulo = findViewById<TextView>(R.id.textViewTitulo)
        tvTitulo.text = "Bienvenido, $userName"
        tvBadge       = findViewById(R.id.tvBadgeMenu)

        // ── Referencias a las Cards (LinearLayouts) ──────────────────────────
        val cardCompras         = findViewById<LinearLayout>(R.id.cardCompras)
        val cardServicio        = findViewById<LinearLayout>(R.id.cardServicio)
        val cardChat            = findViewById<LinearLayout>(R.id.cardChat)
        val cardGear            = findViewById<LinearLayout>(R.id.cardGear) // Notificaciones
        val cardPreguntas       = findViewById<LinearLayout>(R.id.cardPreguntas)
        val cardPerfil          = findViewById<LinearLayout>(R.id.cardPerfil)
        val cardHistorial       = findViewById<LinearLayout>(R.id.cardHistorial)
        val cardComentarios     = findViewById<LinearLayout>(R.id.cardComentarios)
        val cardCategorias      = findViewById<LinearLayout>(R.id.cardCategorias)
        val cardCliente         = findViewById<LinearLayout>(R.id.cardCliente) // Usuarios
        val cardRoles           = findViewById<LinearLayout>(R.id.cardRoles)
        val cardTipoDoc         = findViewById<LinearLayout>(R.id.cardTipoDoc)

        val btnCerrarSesion     = findViewById<Button>(R.id.btnCerrarSesion)

        // ── Referencias a Etiquetas de Sección ───────────────────────────────
        val labelSeccionTecnico = findViewById<TextView>(R.id.labelSeccionTecnico)
        val labelSeccionAdmin   = findViewById<TextView>(R.id.labelSeccionAdmin)

        // ── Visibilidad según rol (igual que la versión web) ──────────────────
        when (userRole) {
            2 -> { // Cliente — solo accede a funciones de usuario
                cardCliente.visibility          = View.GONE
                cardHistorial.visibility        = View.GONE
                cardComentarios.visibility      = View.GONE
                cardCategorias.visibility       = View.GONE
                cardTipoDoc.visibility          = View.GONE
                cardRoles.visibility            = View.GONE
                labelSeccionTecnico.visibility  = View.GONE
                labelSeccionAdmin.visibility    = View.GONE
            }
            1 -> { // Técnico — gestión de servicios, sin administración total
                cardCliente.visibility          = View.GONE
                cardHistorial.visibility        = View.VISIBLE
                cardComentarios.visibility      = View.VISIBLE
                cardCategorias.visibility       = View.VISIBLE
                cardTipoDoc.visibility          = View.GONE
                cardRoles.visibility            = View.GONE
                labelSeccionTecnico.visibility  = View.VISIBLE
                labelSeccionAdmin.visibility    = View.GONE
            }
            3 -> { // Admin — acceso total del sistema
                cardCliente.visibility          = View.VISIBLE
                cardHistorial.visibility        = View.VISIBLE
                cardComentarios.visibility      = View.VISIBLE
                cardCategorias.visibility       = View.VISIBLE
                cardTipoDoc.visibility          = View.VISIBLE
                cardRoles.visibility            = View.VISIBLE
                labelSeccionTecnico.visibility  = View.VISIBLE
                labelSeccionAdmin.visibility    = View.VISIBLE
            }
            else -> { // Por seguridad, si el rol no coincide, se ocultan
                cardCliente.visibility          = View.GONE
                cardHistorial.visibility        = View.GONE
                cardComentarios.visibility      = View.GONE
                cardCategorias.visibility       = View.GONE
                cardTipoDoc.visibility          = View.GONE
                cardRoles.visibility            = View.GONE
                labelSeccionTecnico.visibility  = View.GONE
                labelSeccionAdmin.visibility    = View.GONE
            }
        }

        // ── Acciones de Clic en las Cards ─────────────────────────────────────

        // Productos/Catálogo: cliente → catálogo, técnico/admin → gestionar productos
        cardCompras.setOnClickListener {
            val intent = if (userRole == 2) {
                Intent(this, CatalogoActivity::class.java)
            } else {
                Intent(this, ProductoActivity::class.java)
            }
            startActivity(intent)
        }

        // Servicios: cliente → solicitar, técnico/admin → gestionar
        cardServicio.setOnClickListener {
            val intent = if (userRole == 2) {
                Intent(this, SolicitarServicioActivity::class.java)
            } else {
                Intent(this, ServicioActivity::class.java)
            }
            startActivity(intent)
        }

        // Chats
        cardChat.setOnClickListener {
            startActivity(Intent(this, ChatListActivity::class.java))
        }

        // Notificaciones
        cardGear.setOnClickListener {
            startActivity(Intent(this, NotificacionActivity::class.java))
        }

        // Preguntas y consultas (todos los roles)
        cardPreguntas.setOnClickListener {
            startActivity(Intent(this, PreguntasActivity::class.java))
        }

        // Perfil
        cardPerfil.setOnClickListener {
            startActivity(Intent(this, PerfilActivity::class.java))
        }

        // Historial (técnico y admin)
        cardHistorial.setOnClickListener {
            startActivity(Intent(this, HistorialActivity::class.java))
        }

        // Comentarios (técnico y admin)
        cardComentarios.setOnClickListener {
            startActivity(Intent(this, ComentariosActivity::class.java))
        }

        // Categorías (técnico y admin)
        cardCategorias.setOnClickListener {
            startActivity(Intent(this, CategoriaActivity::class.java))
        }

        // Usuarios / Clientes (solo admin)
        cardCliente.setOnClickListener {
            startActivity(Intent(this, ClienteActivity::class.java))
        }

        // Roles (solo admin)
        cardRoles.setOnClickListener {
            startActivity(Intent(this, RolesActivity::class.java))
        }

        // Tipo de Documento (solo admin)
        cardTipoDoc.setOnClickListener {
            startActivity(Intent(this, TipoDocumentoActivity::class.java))
        }

        // ── Cerrar sesión ─────────────────────────────────────────────────────
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
                // Manejo silencioso de errores de red o token expirado
            }
        })
    }
}
