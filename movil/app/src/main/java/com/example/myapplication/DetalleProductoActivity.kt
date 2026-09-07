package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_detalle_producto)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        idUsuario = sharedPref.getString("user_id", "") ?: ""

        api = ApiClient.retrofit.create(ApiService::class.java)

        codigoProducto = intent.getStringExtra("CODIGO") ?: ""
        nombreProducto = intent.getStringExtra("NOMBRE") ?: ""
        val nombre = nombreProducto
        val desc = intent.getStringExtra("DESCRIPCION") ?: ""
        val precio = intent.getDoubleExtra("PRECIO", 0.0)
        val categoriaNombre = intent.getStringExtra("CATEGORIANOMBRE") ?: ""
        val imagenUrl = intent.getStringExtra("IMAGEN") ?: ""

        findViewById<android.widget.TextView>(R.id.tvNombreDetalle).text    = nombre
        findViewById<android.widget.TextView>(R.id.tvCategoriaDetalle).text = categoriaNombre
        findViewById<android.widget.TextView>(R.id.tvPrecioDetalle).text    = "$${"%.0f".format(precio)}"
        findViewById<android.widget.TextView>(R.id.tvDescripcionDetalle).text = desc.ifEmpty { "Sin descripción" }

        val ivProducto = findViewById<android.widget.ImageView>(R.id.imgDetalleProducto)
        if (imagenUrl.isNotEmpty() && ivProducto != null) {
            com.bumptech.glide.Glide.with(this)
                .load(imagenUrl)
                .into(ivProducto)
        }

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
                            // Igual que en la web: solo informar y redirigir a "Mis Preguntas"
                            androidx.appcompat.app.AlertDialog.Builder(this@DetalleProductoActivity)
                                .setTitle("¡Pregunta enviada!")
                                .setMessage("Tu pregunta ha sido enviada al técnico. Podrás ver la respuesta en la sección \"Mis Preguntas\".")
                                .setPositiveButton("Ver Mis Preguntas") { _, _ ->
                                    startActivity(Intent(this@DetalleProductoActivity, PreguntasActivity::class.java))
                                }
                                .setNegativeButton("Cerrar", null)
                                .show()
                        } else {
                            Toast.makeText(this@DetalleProductoActivity, "Error al enviar: ${response.code()}", Toast.LENGTH_SHORT).show()
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
}
