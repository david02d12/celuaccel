package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Chat
import com.example.myapplication.model.Mensaje
import com.example.myapplication.model.Pregunta
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class DetalleProductoActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var usuarioId: String
    private lateinit var apiService: ApiService

    private var codigoProducto: String = ""
    private var nombreProducto: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_detalle_producto)

        // Recuperar credenciales guardadas en la app (SharedPreferences)
        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        usuarioId = sharedPref.getString("user_id", "") ?: ""

        apiService = ApiClient.retrofit.create(ApiService::class.java)

        // Vincular componentes visuales del XML corregido
        val tvNombre = findViewById<TextView>(R.id.tvNombreDetalle)
        val tvCategoria = findViewById<TextView>(R.id.tvCategoriaDetalle)
        val tvPrecio = findViewById<TextView>(R.id.tvPrecioDetalle)
        val tvStock = findViewById<TextView>(R.id.tvStockDetalle)
        val tvDescripcion = findViewById<TextView>(R.id.tvDescripcionDetalle)
        val etPregunta = findViewById<EditText>(R.id.etPreguntaTecnico)
        val btnEnviar = findViewById<Button>(R.id.btnEnviarPregunta)
        val btnRegresar = findViewById<Button>(R.id.btnRegresarDetalle)

        // Desempaquetar datos enviados por el Intent desde CatalogoActivity
        codigoProducto = intent.getStringExtra("CODIGO") ?: ""
        nombreProducto = intent.getStringExtra("NOMBRE") ?: ""
        val descripcion = intent.getStringExtra("DESCRIPCION") ?: ""
        val precio = intent.getDoubleExtra("PRECIO", 0.0)
        val cantidad = intent.getIntExtra("CANTIDAD", 0)
        val categoriaNombre = intent.getStringExtra("CATEGORIANOMBRE") ?: "Sin categoría"

        // Pintar la interfaz con la información del repuesto/equipo
        tvNombre.text = nombreProducto
        tvCategoria.text = categoriaNombre
        tvPrecio.text = "$$precio"
        tvStock.text = "Disponibles: $cantidad uds"
        tvDescripcion.text = descripcion

        btnRegresar.setOnClickListener { finish() }

        btnEnviar.setOnClickListener {
            val preguntaTexto = etPregunta.text.toString().trim()
            if (preguntaTexto.isEmpty()) {
                Toast.makeText(this, "Por favor escribe tu pregunta.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (usuarioId.isEmpty()) {
                Toast.makeText(this, "Error de sesión. Reconecta tu cuenta.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            btnEnviar.isEnabled = false
            btnEnviar.text = "Conectando con técnico..."
            registrarPreguntaHistorial(preguntaTexto, btnEnviar)
        }
    }

    // =========================================================================
    // PASO 1: Agregar registro a la tabla Preguntas (Historial/Auditoría)
    // =========================================================================
    private fun registrarPreguntaHistorial(preguntaTexto: String, boton: Button) {
        val fechaActual = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

        val nuevaPregunta = Pregunta(
            idConsulta = null,
            idUsuario = usuarioId,
            codigoProducto = codigoProducto,
            pregunta = preguntaTexto,
            fecha = fechaActual
        )

        apiService.agregarPregunta(token, nuevaPregunta).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    crearChatDeConsulta(preguntaTexto, boton)
                } else {
                    reestablecerBoton(boton, "Error al registrar consulta (${response.code()})")
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                reestablecerBoton(boton, "Fallo de conexión en red")
            }
        })
    }

    // =========================================================================
    // PASO 2: Crear el Canal de Chat vacío (Soportando idServicio ambiguo de la DB)
    // =========================================================================
    private fun crearChatDeConsulta(preguntaTexto: String, boton: Button) {
        val nuevoChat = Chat(
            codigoChat = null,
            idUsuario = usuarioId,
            idServicio = null
        )

        apiService.crearChat(token, nuevoChat).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    // Como crearChat devuelve un cuerpo vacío (Void), consultamos la lista para obtener el ID asignado
                    recuperarIdDelChatCreado(preguntaTexto, boton)
                } else {
                    reestablecerBoton(boton, "Error al instanciar canal de chat")
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                reestablecerBoton(boton, "Fallo al inicializar chat")
            }
        })
    }

    // =========================================================================
    // PASO 2.5: Recuperar el Código asignado al chat creado
    // =========================================================================
    private fun recuperarIdDelChatCreado(preguntaTexto: String, boton: Button) {
        apiService.getMisChats(token).enqueue(object : Callback<List<Chat>> {
            override fun onResponse(call: Call<List<Chat>>, response: Response<List<Chat>>) {
                if (response.isSuccessful && !response.body().isNullOrEmpty()) {
                    // Buscar el chat de consulta recién creado (sin servicio asociado)
                    val chatReciente = response.body()!!
                        .lastOrNull { it.idUsuario == usuarioId && it.idServicio == null }

                    if (chatReciente?.codigoChat != null) {
                        enviarPrimerMensajeContextual(chatReciente.codigoChat!!, preguntaTexto, boton)
                    } else {
                        reestablecerBoton(boton, "No se localizó el índice del chat")
                    }
                } else {
                    reestablecerBoton(boton, "Error sincronizando datos del chat")
                }
            }
            override fun onFailure(call: Call<List<Chat>>, t: Throwable) {
                reestablecerBoton(boton, "Fallo de red al indexar")
            }
        })
    }

    // =========================================================================
    // PASO 3: Enviar el mensaje inicial formateado y saltar a la pantalla de chat
    // =========================================================================
    private fun enviarPrimerMensajeContextual(codigoChatId: Int, preguntaTexto: String, boton: Button) {
        val fechaActual = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

        val mensaje = Mensaje(
            codigoMensaje = null,
            codigoChat = codigoChatId,
            idUsuario = usuarioId,
            fechaMensaje = fechaActual,
            mensaje = "Consulta sobre \"$nombreProducto\": $preguntaTexto",
            estado = null,
            dueno = null,
            rol = null
        )

        apiService.enviarMensaje(token, mensaje).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@DetalleProductoActivity, "¡Consulta enviada! Redirigiendo...", Toast.LENGTH_SHORT).show()

                    // Saltamos directamente a la ventana activa de mensajes
                    val intent = Intent(this@DetalleProductoActivity, ChatDetailActivity::class.java).apply {
                        putExtra("CODIGO_CHAT", codigoChatId)
                        putExtra("ID_SERVICIO", -1) // Enviamos -1 para indicarle al Chat que use el header dinámico de consulta
                    }
                    startActivity(intent)
                    finish()
                } else {
                    reestablecerBoton(boton, "Error enviando el mensaje de apertura")
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                reestablecerBoton(boton, "Fallo de red al enlazar mensaje")
            }
        })
    }

    private fun reestablecerBoton(boton: Button, mensajeError: String) {
        boton.isEnabled = true
        boton.text = "Chatear con el Técnico"
        Toast.makeText(this, mensajeError, Toast.LENGTH_SHORT).show()
    }
}