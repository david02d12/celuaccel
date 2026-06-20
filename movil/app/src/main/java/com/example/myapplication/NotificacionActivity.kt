package com.example.myapplication

import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Notificacion
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class NotificacionActivity : AppCompatActivity() {

    private lateinit var token: String
    private var userRole: Int = 2

    private lateinit var recyclerView:   RecyclerView
    private lateinit var tvConteo:       TextView
    private lateinit var btnFiltroTodas: Button
    private lateinit var btnFiltroNuevas:Button
    private lateinit var btnFiltroLeidas:Button

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    /** Lista completa sin filtrar */
    private var listaCompleta: MutableList<Notificacion> = mutableListOf()

    /** Filtro activo: "todas" | "nuevas" | "leidas" */
    private var filtroActual = "todas"

    // ── Colores para pills ──────────────────────────────────────────────────
    private val colorActivo   = Color.parseColor("#DB0000")
    private val colorInactivo = Color.parseColor("#6C757D")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notificacion)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw   = prefs.getString("token", "") ?: ""
        token     = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userRole  = prefs.getInt("user_role", 2)

        // ── Views ───────────────────────────────────────────────────────────
        recyclerView    = findViewById(R.id.recyclerNotificaciones)
        tvConteo        = findViewById(R.id.tvConteoNotif)
        btnFiltroTodas  = findViewById(R.id.btnFiltroTodas)
        btnFiltroNuevas = findViewById(R.id.btnFiltroNuevas)
        btnFiltroLeidas = findViewById(R.id.btnFiltroLeidas)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // ── Botón regresar ──────────────────────────────────────────────────
        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        // ── Botón Nueva Notificación (solo técnico/admin) ───────────────────
        val btnNuevaNotificacion = findViewById<Button>(R.id.btnNuevaNotificacion)
        if (userRole != 2) {
            btnNuevaNotificacion.visibility = View.VISIBLE
            btnNuevaNotificacion.setOnClickListener { mostrarDialogoNuevaNotificacion() }
        } else {
            btnNuevaNotificacion.visibility = View.GONE
        }

        // ── Pills de filtro ─────────────────────────────────────────────────
        btnFiltroTodas.setOnClickListener  { aplicarFiltro("todas") }
        btnFiltroNuevas.setOnClickListener { aplicarFiltro("nuevas") }
        btnFiltroLeidas.setOnClickListener { aplicarFiltro("leidas") }

        cargarNotificaciones()
    }

    private fun cargarNotificaciones() {
        val call: Call<List<Notificacion>> = if (userRole == 2) {
            api.getMisNotificaciones(token)
        } else {
            api.getNotificaciones(token)
        }

        call.enqueue(object : Callback<List<Notificacion>> {
            override fun onResponse(
                call: Call<List<Notificacion>>,
                response: Response<List<Notificacion>>
            ) {
                if (response.isSuccessful && response.body() != null) {
                    listaCompleta = response.body()!!.toMutableList()
                    actualizarConteo()
                    mostrarFiltrado()
                } else {
                    Toast.makeText(
                        this@NotificacionActivity,
                        "Error al cargar notificaciones (${response.code()})",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onFailure(call: Call<List<Notificacion>>, t: Throwable) {
                Toast.makeText(
                    this@NotificacionActivity,
                    "Error de red: ${t.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        })
    }

    // ── Filtrado ────────────────────────────────────────────────────────────
    private fun aplicarFiltro(filtro: String) {
        filtroActual = filtro
        actualizarPills()
        mostrarFiltrado()
    }

    private fun mostrarFiltrado() {
        val lista = when (filtroActual) {
            "nuevas"  -> listaCompleta.filter { it.leida != 1 }
            "leidas"  -> listaCompleta.filter { it.leida == 1 }
            else      -> listaCompleta
        }.toMutableList()

        val adapter = NotificacionAdapter(
            lista,
            onMarcarLeida = { notif ->
                if (userRole == 2) {
                    notif.codigoNotificaciones?.let { id -> marcarLeida(id) }
                }
            },
            onLongClick = { notif ->
                if (userRole != 2) {
                    notif.codigoNotificaciones?.let { id ->
                        androidx.appcompat.app.AlertDialog.Builder(this)
                            .setTitle("Eliminar Notificación")
                            .setMessage("¿Estás seguro de eliminar esta notificación?")
                            .setPositiveButton("Eliminar") { _, _ -> eliminarNotificacion(id) }
                            .setNegativeButton("Cancelar", null)
                            .show()
                    }
                }
            }
        )
        recyclerView.adapter = adapter
    }

    private fun actualizarPills() {
        // Resetear todos a outline
        val inactive = listOf(btnFiltroTodas, btnFiltroNuevas, btnFiltroLeidas)
        inactive.forEach { btn ->
            btn.setBackgroundResource(R.drawable.bg_btn_outline)
            btn.setTextColor(colorActivo)
        }
        // Activar el seleccionado
        val active = when (filtroActual) {
            "nuevas"  -> btnFiltroNuevas
            "leidas"  -> btnFiltroLeidas
            else      -> btnFiltroTodas
        }
        active.setBackgroundResource(R.drawable.bg_btn_primary)
        active.setTextColor(Color.WHITE)
    }

    private fun actualizarConteo() {
        val total   = listaCompleta.size
        val noLeidas = listaCompleta.count { it.leida != 1 }
        tvConteo.text = if (noLeidas > 0)
            "$total notificaciones · $noLeidas sin leer"
        else
            "$total notificaciones"
    }

    // ── API calls ───────────────────────────────────────────────────────────
    private fun marcarLeida(id: Int) {
        api.marcarNotificacionLeida(token, id).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) cargarNotificaciones()
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@NotificacionActivity, "Error al marcar como leída", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun eliminarNotificacion(id: Int) {
        api.eliminarNotificacion(token, id).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@NotificacionActivity, "Notificación eliminada", Toast.LENGTH_SHORT).show()
                    cargarNotificaciones()
                } else {
                    Toast.makeText(this@NotificacionActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@NotificacionActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun mostrarDialogoNuevaNotificacion() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_nueva_notificacion, null)
        val etTitulo       = dialogView.findViewById<EditText>(R.id.etTituloNotif)
        val etMensaje      = dialogView.findViewById<EditText>(R.id.etMensajeNotif)
        val etDestinatario = dialogView.findViewById<EditText>(R.id.etDestinatarioNotif)
        val btnEnviar      = dialogView.findViewById<Button>(R.id.btnEnviarNotif)
        val btnCancelar    = dialogView.findViewById<Button>(R.id.btnCancelarNotif)
        val btnCerrar      = dialogView.findViewById<Button>(R.id.btnCerrarDialog)

        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setView(dialogView)
            .create()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnCerrar.setOnClickListener  { dialog.dismiss() }
        btnCancelar.setOnClickListener{ dialog.dismiss() }

        btnEnviar.setOnClickListener {
            val destino = etDestinatario.text.toString().trim()
            val titulo  = etTitulo.text.toString().trim()
            val mensaje = etMensaje.text.toString().trim()

            if (destino.isEmpty() || mensaje.isEmpty()) {
                Toast.makeText(this, "Destinatario y mensaje son obligatorios", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val nuevaNotif = Notificacion(
                idUsuarioDestino = destino,
                titulo           = titulo.ifEmpty { "Notificación" },
                mensaje          = mensaje
            )

            api.enviarNotificacion(token, nuevaNotif).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@NotificacionActivity, "Notificación enviada", Toast.LENGTH_SHORT).show()
                        dialog.dismiss()
                        cargarNotificaciones()
                    } else {
                        Toast.makeText(this@NotificacionActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@NotificacionActivity, "Error de red", Toast.LENGTH_SHORT).show()
                }
            })
        }

        dialog.show()
    }
}
