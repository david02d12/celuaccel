package com.example.myapplication

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
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
    private lateinit var recyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvSinNotificaciones: TextView
    private lateinit var tvBadge: TextView
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notificacion)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"

        recyclerView          = findViewById(R.id.recyclerNotificaciones)
        progressBar           = findViewById(R.id.progressBarNotif)
        tvSinNotificaciones   = findViewById(R.id.tvSinNotificaciones)
        tvBadge               = findViewById(R.id.tvBadgeNoLeidas)

        recyclerView.layoutManager = LinearLayoutManager(this)

        findViewById<Button>(R.id.btnRegresarNotif).setOnClickListener { finish() }

        findViewById<Button>(R.id.btnMarcarTodasLeidas).setOnClickListener {
            marcarTodasLeidas()
        }

        cargarNotificaciones()
    }

    private fun cargarNotificaciones() {
        progressBar.visibility = View.VISIBLE
        api.getMisNotificaciones(token).enqueue(object : Callback<List<Notificacion>> {
            override fun onResponse(call: Call<List<Notificacion>>, response: Response<List<Notificacion>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful && response.body() != null) {
                    val lista = response.body()!!
                    if (lista.isEmpty()) {
                        tvSinNotificaciones.visibility = View.VISIBLE
                        recyclerView.visibility = View.GONE
                    } else {
                        tvSinNotificaciones.visibility = View.GONE
                        recyclerView.visibility = View.VISIBLE
                        val noLeidas = lista.count { it.leida == 0 }
                        if (noLeidas > 0) {
                            tvBadge.text = "Tienes $noLeidas notificación(es) sin leer"
                            tvBadge.visibility = View.VISIBLE
                        }
                        val adapter = NotificacionAdapter(lista.toMutableList()) { notificacion ->
                            notificacion.codigoNotificaciones?.let { id -> marcarLeida(id) }
                        }
                        recyclerView.adapter = adapter
                    }
                } else {
                    Toast.makeText(this@NotificacionActivity, "Error al cargar notificaciones", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Notificacion>>, t: Throwable) {
                progressBar.visibility = View.GONE
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

    private fun marcarTodasLeidas() {
        api.marcarTodasLeidas(token).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@NotificacionActivity, "Todas marcadas como leídas", Toast.LENGTH_SHORT).show()
                    tvBadge.visibility = View.GONE
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
}
