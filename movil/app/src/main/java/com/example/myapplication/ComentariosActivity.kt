package com.example.myapplication

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
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
    private var userRole: Int = 2
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    private lateinit var recyclerView: RecyclerView
    private lateinit var etComentario: EditText
    private lateinit var btnPublicar: Button
    private lateinit var btnCancelar: Button

    private val starIds = intArrayOf(R.id.star1, R.id.star2, R.id.star3, R.id.star4, R.id.star5)
    private val starViews = mutableListOf<TextView>()
    private var calificacion = 5
    private var enEdicion = false
    private var editandoComentario: Comentario? = null

    private var listaCompleta = listOf<Comentario>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_comentarios)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userId = prefs.getString("user_id", "") ?: ""
        userRole = prefs.getInt("user_role", 2)

        recyclerView = findViewById(R.id.recyclerComentarios)
        etComentario = findViewById(R.id.etComentario)
        btnPublicar = findViewById(R.id.btnPublicar)
        btnCancelar = findViewById(R.id.btnCancelarEdicion)

        recyclerView.layoutManager = LinearLayoutManager(this)

        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }


        for (id in starIds) {
            val star = findViewById<TextView>(id)
            starViews.add(star)
            star.setOnClickListener { setRating(starViews.indexOf(star) + 1) }
        }
        setRating(5)

        btnPublicar.setOnClickListener { publicarComentario() }
        btnCancelar.setOnClickListener { cancelarEdicion() }

        cargarComentarios()
    }

    private fun setRating(rating: Int) {
        calificacion = rating
        for (i in starViews.indices) {
            starViews[i].text = if (i < rating) "★" else "☆"
        }
    }

    private fun publicarComentario() {
        val texto = etComentario.text.toString().trim()
        if (texto.isEmpty()) {
            Toast.makeText(this, "El comentario no puede ir vacío", Toast.LENGTH_SHORT).show()
            return
        }

        if (enEdicion && editandoComentario != null) {
            val updated = editandoComentario!!.copy(
                comentario = texto,
                estrellas = calificacion
            )
            api.actualizarComentario(token, updated).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ComentariosActivity, "Comentario actualizado", Toast.LENGTH_SHORT).show()
                        cancelarEdicion()
                        cargarComentarios()
                    } else {
                        Toast.makeText(this@ComentariosActivity, "Error ${response.code()}", Toast.LENGTH_LONG).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ComentariosActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                }
            })
        } else {
            val nuevo = Comentario(
                idUsuario = userId,
                comentario = texto,
                estrellas = calificacion
            )
            api.agregarComentario(token, nuevo).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ComentariosActivity, "Comentario publicado", Toast.LENGTH_SHORT).show()
                        etComentario.setText("")
                        setRating(5)
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

    private fun cargarComentarios() {
        api.getComentarios(token).enqueue(object : Callback<List<Comentario>> {
            override fun onResponse(call: Call<List<Comentario>>, response: Response<List<Comentario>>) {
                if (response.isSuccessful && response.body() != null) {
                    val todos = response.body()!!
                    listaCompleta = if (userRole == 2) {
                        todos.filter { it.idUsuario == userId }
                    } else {
                        todos
                    }
                    recyclerView.adapter = ComentarioAdapter(
                        listaCompleta, userId, userRole,
                        onDelete = { c -> confirmarEliminar(c) },
                        onEdit = { c -> iniciarEdicion(c) }
                    )
                } else {
                    Toast.makeText(this@ComentariosActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Comentario>>, t: Throwable) {
                Toast.makeText(this@ComentariosActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun iniciarEdicion(c: Comentario) {
        enEdicion = true
        editandoComentario = c
        etComentario.setText(c.comentario)
        setRating(c.estrellas)
        btnPublicar.text = "Actualizar Reseña"
        btnCancelar.visibility = View.VISIBLE
    }

    private fun cancelarEdicion() {
        enEdicion = false
        editandoComentario = null
        etComentario.setText("")
        setRating(5)
        btnPublicar.text = "Publicar Experiencia"
        btnCancelar.visibility = View.GONE
    }

    private fun confirmarEliminar(c: Comentario) {
        AlertDialog.Builder(this)
            .setTitle("Eliminar Comentario")
            .setMessage("¿Estás seguro de eliminar este comentario?")
            .setPositiveButton("Eliminar") { _, _ ->
                c.codigoComentario?.let { id ->
                    api.deleteComentario(token, id).enqueue(object : Callback<Void> {
                        override fun onResponse(call: Call<Void>, response: Response<Void>) {
                            if (response.isSuccessful) {
                                Toast.makeText(this@ComentariosActivity, "Comentario eliminado", Toast.LENGTH_SHORT).show()
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
            .setNegativeButton("Cancelar", null)
            .show()
    }
}
