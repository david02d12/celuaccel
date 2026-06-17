package com.example.myapplication

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Pregunta
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class PreguntasActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var userId: String
    private var userRole: Int = 2
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    private lateinit var recyclerView:  RecyclerView
    private lateinit var etContenido:   EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_preguntas)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token    = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userId   = prefs.getString("user_id", "") ?: ""
        userRole = prefs.getInt("user_role", 2)

        recyclerView = findViewById(R.id.recyclerPreguntas)
        etContenido  = findViewById(R.id.etContenidoPregunta)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // Para clientes: mostrar el card de nueva pregunta con toggle
        val cardNuevaPregunta = findViewById<View>(R.id.cardNuevaPregunta)
        val btnNuevaPregunta  = findViewById<Button>(R.id.btnNuevaPregunta)
        if (userRole == 2) {
            btnNuevaPregunta.setOnClickListener {
                val visible = cardNuevaPregunta.visibility == View.VISIBLE
                cardNuevaPregunta.visibility = if (visible) View.GONE else View.VISIBLE
            }
        } else {
            btnNuevaPregunta.visibility    = View.GONE
            cardNuevaPregunta.visibility   = View.GONE
        }

        findViewById<Button>(R.id.btnEnviarPregunta).setOnClickListener { enviarPregunta() }
        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        cargarPreguntas()
    }

    private fun cargarPreguntas() {
        val call = if (userRole == 2) api.getMisPreguntas(token) else api.getPreguntas(token)

        call.enqueue(object : Callback<List<Pregunta>> {
            override fun onResponse(call: Call<List<Pregunta>>, response: Response<List<Pregunta>>) {
                if (response.isSuccessful && response.body() != null) {
                    val lista = response.body()!!
                    recyclerView.adapter = PreguntaAdapter(lista, userId, userRole, { p ->
                        confirmarEliminarPregunta(p)
                    }, { p ->
                        mostrarDialogoResponder(p)
                    })
                } else {
                    Toast.makeText(this@PreguntasActivity, "Error al cargar preguntas: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Pregunta>>, t: Throwable) {
                Toast.makeText(this@PreguntasActivity, "Error de red: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun confirmarEliminarPregunta(p: Pregunta) {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Eliminar Pregunta")
            .setMessage("¿Estás seguro de eliminar esta pregunta?")
            .setPositiveButton("Eliminar") { _, _ ->
                p.idConsulta?.let { id ->
                    api.deletePregunta(token, id).enqueue(object : Callback<Void> {
                        override fun onResponse(call: Call<Void>, response: Response<Void>) {
                            if (response.isSuccessful) {
                                Toast.makeText(this@PreguntasActivity, "Pregunta eliminada", Toast.LENGTH_SHORT).show()
                                cargarPreguntas()
                            } else {
                                Toast.makeText(this@PreguntasActivity, "Error al eliminar: ${response.code()}", Toast.LENGTH_SHORT).show()
                            }
                        }
                        override fun onFailure(call: Call<Void>, t: Throwable) {
                            Toast.makeText(this@PreguntasActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                        }
                    })
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun mostrarDialogoResponder(p: Pregunta) {
        val input = EditText(this)
        input.hint = "Escribe tu respuesta aquí..."
        input.setText(p.respuesta ?: "")

        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Responder Pregunta")
            .setView(input)
            .setPositiveButton("Guardar") { _, _ ->
                val respuestaTexto = input.text.toString().trim()
                if (respuestaTexto.isNotEmpty()) {
                    val fechaActual = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
                    val pActualizada = p.copy(
                        respuesta = respuestaTexto,
                        idTecnicoResponde = userId,
                        fechaRespuesta = fechaActual
                    )
                    
                    api.actualizarPregunta(token, pActualizada).enqueue(object : Callback<Void> {
                        override fun onResponse(call: Call<Void>, response: Response<Void>) {
                            if (response.isSuccessful) {
                                Toast.makeText(this@PreguntasActivity, "Respuesta guardada", Toast.LENGTH_SHORT).show()
                                cargarPreguntas()
                            } else {
                                Toast.makeText(this@PreguntasActivity, "Error al guardar: ${response.code()}", Toast.LENGTH_SHORT).show()
                            }
                        }
                        override fun onFailure(call: Call<Void>, t: Throwable) {
                            Toast.makeText(this@PreguntasActivity, "Error de red", Toast.LENGTH_SHORT).show()
                        }
                    })
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun enviarPregunta() {
        val texto = etContenido.text.toString().trim()
        if (texto.isEmpty()) {
            Toast.makeText(this, "Escribe tu pregunta antes de enviar", Toast.LENGTH_SHORT).show()
            return
        }

        val fecha = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val nuevaPregunta = Pregunta(
            idUsuario      = userId,
            codigoProducto = "",   // No aplica para preguntas de soporte general
            pregunta       = texto,
            fecha          = fecha
        )

        api.agregarPregunta(token, nuevaPregunta).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@PreguntasActivity, "Consulta enviada correctamente", Toast.LENGTH_SHORT).show()
                    etContenido.text.clear()
                    cargarPreguntas()
                } else {
                    Toast.makeText(this@PreguntasActivity, "Error al enviar: ${response.code()}", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@PreguntasActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
