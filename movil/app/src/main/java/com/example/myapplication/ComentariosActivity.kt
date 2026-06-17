package com.example.myapplication

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.RatingBar
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
    private var userRole: Int = 2
    private var idServicio: Int = -1
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    private var enEdicion = false
    private var comentarioEnEdicion: Comentario? = null

    private lateinit var recyclerView: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_comentarios)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw  = prefs.getString("token", "") ?: ""
        token    = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userId   = prefs.getString("user_id", "") ?: ""
        userRole = prefs.getInt("user_role", 2)
        idServicio = intent.getIntExtra("ID_SERVICIO", -1)

        // IDs del nuevo activity_comentarios.xml
        recyclerView = findViewById(R.id.recyclerComentarios)
        recyclerView.layoutManager = LinearLayoutManager(this)

        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        cargarComentarios()
    }

    private fun cargarComentarios() {
        api.getComentarios(token).enqueue(object : Callback<List<Comentario>> {
            override fun onResponse(call: Call<List<Comentario>>, response: Response<List<Comentario>>) {
                if (response.isSuccessful && response.body() != null) {
                    val todos = response.body()!!
                    val lista = if (idServicio != -1) todos.filter { it.idServicio == idServicio } else todos

                    recyclerView.adapter = ComentarioAdapter(
                        lista, userId, userRole,
                        onDelete = { c -> confirmarEliminarComentario(c) },
                        onEdit   = { c -> mostrarDialogoComentario(c) }
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

    /**
     * Diálogo para CREAR o EDITAR comentario.
     * Si [comentario] es null → modo crear; si tiene valor → modo editar.
     */
    private fun mostrarDialogoComentario(comentario: Comentario? = null) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_comentario, null)
        val etTexto    = dialogView.findViewById<EditText>(R.id.etTextoDialog)
        val ratingBar  = dialogView.findViewById<RatingBar>(R.id.ratingBarDialog)

        if (comentario != null) {
            etTexto.setText(comentario.comentario)
            ratingBar.rating = (comentario.calificacion ?: 5).toFloat()
        } else {
            ratingBar.rating = 5f
        }

        val titulo = if (comentario != null) "Editar Comentario" else "Nuevo Comentario"

        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(titulo)
            .setView(dialogView)
            .setPositiveButton(if (comentario != null) "Actualizar" else "Publicar") { _, _ ->
                val texto        = etTexto.text.toString().trim()
                val calificacion = ratingBar.rating.toInt()

                if (texto.isEmpty()) {
                    Toast.makeText(this, "Escribe un comentario", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }

                if (comentario != null) {
                    // EDITAR
                    api.actualizarComentario(token, comentario.copy(comentario = texto, calificacion = calificacion))
                        .enqueue(simpleCallback("Comentario actualizado"))
                } else {
                    // CREAR
                    if (idServicio == -1) {
                        Toast.makeText(this, "No se puede comentar sin servicio asociado", Toast.LENGTH_SHORT).show()
                        return@setPositiveButton
                    }
                    val nuevo = Comentario(idServicio = idServicio, comentario = texto, calificacion = calificacion)
                    api.agregarComentario(token, nuevo).enqueue(simpleCallback("Comentario publicado"))
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun confirmarEliminarComentario(c: Comentario) {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Eliminar Comentario")
            .setMessage("¿Estás seguro de eliminar este comentario?")
            .setPositiveButton("Eliminar") { _, _ ->
                c.codigoComentario?.let { id ->
                    api.deleteComentario(token, id).enqueue(simpleCallback("Comentario eliminado"))
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun simpleCallback(msgOk: String): Callback<Void> =
        object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@ComentariosActivity, msgOk, Toast.LENGTH_SHORT).show()
                    cargarComentarios()
                } else {
                    Toast.makeText(this@ComentariosActivity, "Error ${response.code()}", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@ComentariosActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        }
}
