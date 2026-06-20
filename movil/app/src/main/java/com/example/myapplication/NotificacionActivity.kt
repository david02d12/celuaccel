package com.example.myapplication

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
    private lateinit var recyclerView: RecyclerView
    private lateinit var tvConteo: TextView
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notificacion)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw  = prefs.getString("token", "") ?: ""
        token    = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userRole = prefs.getInt("user_role", 2)

        // IDs del nuevo activity_notificacion.xml
        recyclerView = findViewById(R.id.recyclerNotificaciones)
        tvConteo     = findViewById(R.id.tvConteoNotif)

        recyclerView.layoutManager = LinearLayoutManager(this)

        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        // Botón "Nueva Notificación" — solo visible para técnico/admin
        val btnNuevaNotificacion = findViewById<Button>(R.id.btnNuevaNotificacion)
        if (userRole != 2) {
            btnNuevaNotificacion.visibility = View.VISIBLE
            btnNuevaNotificacion.setOnClickListener { mostrarDialogoNuevaNotificacion() }
        } else {
            btnNuevaNotificacion.visibility = View.GONE
        }

        cargarNotificaciones()
    }

    private fun cargarNotificaciones() {
        // Rol 2 (cliente) → sus notificaciones | Rol 1/3 → todas
        val call: Call<List<Notificacion>> = if (userRole == 2) {
            api.getMisNotificaciones(token)
        } else {
            api.getNotificaciones(token)
        }

        call.enqueue(object : Callback<List<Notificacion>> {
            override fun onResponse(call: Call<List<Notificacion>>, response: Response<List<Notificacion>>) {
                if (response.isSuccessful && response.body() != null) {
                    val lista = response.body()!!

                    // Contador en el header
                    val noLeidas = lista.count { it.leida == 0 }
                    tvConteo.text = if (noLeidas > 0)
                        "${lista.size} notificaciones · $noLeidas sin leer"
                    else
                        "${lista.size} notificaciones"

                    val adapter = NotificacionAdapter(
                        lista.toMutableList(),
                        onMarcarLeida = { notificacion ->
                            // Todos los roles pueden marcar sus notificaciones como leídas
                            notificacion.codigoNotificaciones?.let { id -> marcarLeida(id) }
                        },
                        onLongClick = { notificacion ->
                            if (userRole != 2) {
                                notificacion.codigoNotificaciones?.let { id ->
                                    androidx.appcompat.app.AlertDialog.Builder(this@NotificacionActivity)
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
                } else {
                    Toast.makeText(
                        this@NotificacionActivity,
                        "Error al cargar notificaciones (${response.code()})",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
            override fun onFailure(call: Call<List<Notificacion>>, t: Throwable) {
                Toast.makeText(this@NotificacionActivity, "Error de red: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

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
                    Toast.makeText(this@NotificacionActivity, "Error al eliminar: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@NotificacionActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun mostrarDialogoNuevaNotificacion() {
        // dialog_nueva_notificacion.xml IDs: etTituloNotif, etMensajeNotif, etDestinatarioNotif
        val dialogView = layoutInflater.inflate(R.layout.dialog_nueva_notificacion, null)
        val etTitulo      = dialogView.findViewById<EditText>(R.id.etTituloNotif)
        val etMensaje     = dialogView.findViewById<EditText>(R.id.etMensajeNotif)
        val etDestinatario= dialogView.findViewById<EditText>(R.id.etDestinatarioNotif)
        val btnEnviar     = dialogView.findViewById<Button>(R.id.btnEnviarNotif)
        val btnCancelar   = dialogView.findViewById<Button>(R.id.btnCancelarNotif)
        val btnCerrar     = dialogView.findViewById<Button>(R.id.btnCerrarDialog)

        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setView(dialogView)
            .create()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnCerrar.setOnClickListener  { dialog.dismiss() }
        btnCancelar.setOnClickListener { dialog.dismiss() }

        btnEnviar.setOnClickListener {
            val destino  = etDestinatario.text.toString().trim()
            val titulo   = etTitulo.text.toString().trim()
            val mensaje  = etMensaje.text.toString().trim()

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
