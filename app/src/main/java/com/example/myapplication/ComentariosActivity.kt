package com.example.myapplication

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.RatingBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Comentario
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ComentariosActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var userId: String
    private var idServicio: Int = -1
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    private lateinit var recyclerView: RecyclerView
    private lateinit var progressBar:  ProgressBar
    private lateinit var tvSin:        TextView
    private lateinit var etComentario: EditText
    private lateinit var ratingBar:    RatingBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_comentarios)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw  = prefs.getString("token", "") ?: ""
        token    = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userId   = prefs.getString("user_id", "") ?: ""
        idServicio = intent.getIntExtra("ID_SERVICIO", -1)

        recyclerView = findViewById(R.id.recyclerComentarios)
        progressBar  = findViewById(R.id.progressBarComentarios)
        tvSin        = findViewById(R.id.tvSinComentarios)
        etComentario = findViewById(R.id.etNuevoComentario)
        ratingBar    = findViewById(R.id.ratingBarComentario)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // Ocultar formulario si no se conoce el servicio
        if (idServicio == -1) {
            findViewById<View>(R.id.layoutNuevoComentario).visibility = View.GONE
        }

        findViewById<Button>(R.id.btnEnviarComentario).setOnClickListener { enviarComentario() }
        findViewById<Button>(R.id.btnRegresarComentarios).setOnClickListener { finish() }

        cargarComentarios()
    }

    private fun cargarComentarios() {
        progressBar.visibility = View.VISIBLE
        api.getComentarios(token).enqueue(object : Callback<List<Comentario>> {
            override fun onResponse(call: Call<List<Comentario>>, response: Response<List<Comentario>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful && response.body() != null) {
                    // Filtrar por servicio si se pasó el ID
                    val todos  = response.body()!!
                    val lista  = if (idServicio != -1) todos.filter { it.idServicio == idServicio } else todos
                    if (lista.isEmpty()) {
                        tvSin.visibility        = View.VISIBLE
                        recyclerView.visibility = View.GONE
                    } else {
                        tvSin.visibility        = View.GONE
                        recyclerView.visibility = View.VISIBLE
                        recyclerView.adapter    = ComentarioAdapter(lista)
                    }
                } else {
                    Toast.makeText(this@ComentariosActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Comentario>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@ComentariosActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun enviarComentario() {
        val texto = etComentario.text.toString().trim()
        if (texto.isEmpty()) {
            Toast.makeText(this, "Escribe un comentario antes de publicar", Toast.LENGTH_SHORT).show()
            return
        }

        val calificacion = ratingBar.rating.toInt()
        val nuevoComentario = Comentario(
            idServicio   = idServicio,
            comentario   = texto,
            calificacion = calificacion
        )

        api.agregarComentario(token, nuevoComentario).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@ComentariosActivity, "Comentario publicado", Toast.LENGTH_SHORT).show()
                    etComentario.text.clear()
                    ratingBar.rating = 5f
                    cargarComentarios()
                } else {
                    Toast.makeText(this@ComentariosActivity, "Error ${response.code()}", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@ComentariosActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
