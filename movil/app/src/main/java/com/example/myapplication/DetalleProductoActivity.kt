package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Chat
import com.example.myapplication.model.ChatResponse
import com.example.myapplication.model.Mensaje
import com.example.myapplication.model.Pregunta
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DetalleProductoActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var api: ApiService
    private lateinit var idUsuario: String
    private lateinit var codigoProducto: String
    private lateinit var nombreProducto: String
    private var userRole: Int = 2

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_detalle_producto)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        idUsuario = sharedPref.getString("user_id", "") ?: ""
        userRole = sharedPref.getInt("user_role", 2)

        api = ApiClient.retrofit.create(ApiService::class.java)

        codigoProducto = intent.getStringExtra("CODIGO") ?: ""
        nombreProducto = intent.getStringExtra("NOMBRE") ?: ""
        val nombre = nombreProducto
        val desc = intent.getStringExtra("DESCRIPCION") ?: ""
        val precio = intent.getDoubleExtra("PRECIO", 0.0)
        val stock = intent.getIntExtra("CANTIDAD", 0)
        val categoriaNombre = intent.getStringExtra("CATEGORIANOMBRE") ?: ""

        findViewById<TextView>(R.id.tvNombreDetalle).text   = nombre
        findViewById<TextView>(R.id.tvCategoriaDetalle).text= categoriaNombre
        findViewById<TextView>(R.id.tvPrecioDetalle).text   = "$${"%.0f".format(precio)}"
        findViewById<TextView>(R.id.tvDescripcionDetalle).text = desc.ifEmpty { "Sin descripción" }

        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        val btnHacerPregunta = findViewById<Button?>(R.id.btnHacerPregunta)
        btnHacerPregunta?.setOnClickListener { mostrarDialogoPregunta() }
    }

    private fun mostrarDialogoPregunta() {
        if (idUsuario.isEmpty()) {
            androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Inicia Sesión")
                .setMessage("Por favor, inicia sesión para hacer una pregunta sobre el producto.")
                .setPositiveButton("Iniciar Sesión") { _, _ ->
                    startActivity(Intent(this, LoginActivity::class.java))
                }
                .setNegativeButton("Cancelar", null)
                .show()
            return
        }

        val input = EditText(this)
        input.hint = "Escribe tu pregunta sobre el producto..."
        input.inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE

        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Hacer una Pregunta")
            .setView(input)
            .setPositiveButton("Enviar") { _, _ ->
                val texto = input.text.toString().trim()
                if (texto.isEmpty()) {
                    Toast.makeText(this, "Escribe una pregunta", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val fecha = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                val preguntaReq = Pregunta(
                    idUsuario      = idUsuario,
                    codigoProducto = codigoProducto,
                    pregunta       = texto,
                    fecha          = fecha
                )
                api.agregarPregunta(token, preguntaReq).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            if (userRole == 2) {
                                crearChatDesdePregunta(texto, fecha)
                            } else {
                                Toast.makeText(this@DetalleProductoActivity, "¡Pregunta enviada!", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            Toast.makeText(this@DetalleProductoActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        Toast.makeText(this@DetalleProductoActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                    }
                })
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun crearChatDesdePregunta(texto: String, fecha: String) {
        val nuevoChat = Chat(idUsuario = idUsuario)
        api.crearChat(token, nuevoChat).enqueue(object : Callback<ChatResponse> {
            override fun onResponse(call: Call<ChatResponse>, response: Response<ChatResponse>) {
                if (response.isSuccessful && response.body()?.id != null) {
                    val chatId = response.body()!!.id!!
                    val mensajeReq = Mensaje(
                        codigoChat   = chatId,
                        idUsuario    = idUsuario,
                        mensaje      = "Consulta sobre $nombreProducto: $texto",
                        fechaMensaje = fecha
                    )
                    api.enviarMensaje(token, mensajeReq).enqueue(object : Callback<Void> {
                        override fun onResponse(call: Call<Void>, resp: Response<Void>) {
                            if (resp.isSuccessful) {
                                androidx.appcompat.app.AlertDialog.Builder(this@DetalleProductoActivity)
                                    .setTitle("Pregunta enviada")
                                    .setMessage("Se ha creado un chat para tu consulta. ¿Quieres abrirlo?")
                                    .setPositiveButton("Abrir Chat") { _, _ ->
                                        val intent = Intent(this@DetalleProductoActivity, ChatDetailActivity::class.java)
                                        intent.putExtra("CODIGO_CHAT", chatId)
                                        startActivity(intent)
                                    }
                                    .setNegativeButton("Cerrar", null)
                                    .show()
                            } else {
                                Toast.makeText(this@DetalleProductoActivity, "Pregunta enviada. Error al enviar mensaje al chat.", Toast.LENGTH_SHORT).show()
                            }
                        }
                        override fun onFailure(call: Call<Void>, t: Throwable) {
                            Toast.makeText(this@DetalleProductoActivity, "Pregunta enviada. Error de red al enviar mensaje al chat.", Toast.LENGTH_SHORT).show()
                        }
                    })
                } else {
                    Toast.makeText(this@DetalleProductoActivity, "Pregunta enviada. Error al crear chat.", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<ChatResponse>, t: Throwable) {
                Toast.makeText(this@DetalleProductoActivity, "Pregunta enviada. Error de red al crear chat.", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
