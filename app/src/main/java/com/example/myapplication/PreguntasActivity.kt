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
    private lateinit var progressBar:   ProgressBar
    private lateinit var tvSin:         TextView
    private lateinit var etPregunta:    EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_preguntas)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token    = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userId   = prefs.getString("user_id", "") ?: ""
        userRole = prefs.getInt("user_role", 2)

        recyclerView = findViewById(R.id.recyclerPreguntas)
        progressBar  = findViewById(R.id.progressBarPreguntas)
        tvSin        = findViewById(R.id.tvSinPreguntas)
        etPregunta   = findViewById(R.id.etNuevaPregunta)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // Si no es cliente, ocultar formulario de nueva pregunta
        if (userRole != 2) {
            findViewById<View>(R.id.layoutNuevaPregunta).visibility = View.GONE
        }

        findViewById<Button>(R.id.btnEnviarPregunta).setOnClickListener { enviarPregunta() }
        findViewById<Button>(R.id.btnRegresarPreguntas).setOnClickListener { finish() }

        cargarPreguntas()
    }

    private fun cargarPreguntas() {
        progressBar.visibility = View.VISIBLE
        val call = if (userRole == 2) api.getMisPreguntas(token) else api.getPreguntas(token)

        call.enqueue(object : Callback<List<Pregunta>> {
            override fun onResponse(call: Call<List<Pregunta>>, response: Response<List<Pregunta>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful && response.body() != null) {
                    val lista = response.body()!!
                    if (lista.isEmpty()) {
                        tvSin.visibility = View.VISIBLE
                        recyclerView.visibility = View.GONE
                    } else {
                        tvSin.visibility = View.GONE
                        recyclerView.visibility = View.VISIBLE
                        recyclerView.adapter = PreguntaAdapter(lista)
                    }
                } else {
                    Toast.makeText(this@PreguntasActivity, "Error al cargar preguntas: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Pregunta>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@PreguntasActivity, "Error de red: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun enviarPregunta() {
        val texto = etPregunta.text.toString().trim()
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
                    etPregunta.text.clear()
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
