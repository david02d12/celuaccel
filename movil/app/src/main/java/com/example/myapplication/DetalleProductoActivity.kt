package com.example.myapplication

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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_detalle_producto)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        idUsuario = sharedPref.getString("user_id", "") ?: ""

        api = ApiClient.retrofit.create(ApiService::class.java)

        codigoProducto = intent.getStringExtra("CODIGO") ?: ""
        val nombre = intent.getStringExtra("NOMBRE") ?: ""
        val desc = intent.getStringExtra("DESCRIPCION") ?: ""
        val precio = intent.getDoubleExtra("PRECIO", 0.0)
        val stock = intent.getIntExtra("CANTIDAD", 0)
        val categoriaNombre = intent.getStringExtra("CATEGORIANOMBRE") ?: ""

        // IDs del nuevo activity_detalle_producto.xml
        findViewById<android.widget.TextView>(R.id.tvNombreDetalle).text   = nombre
        findViewById<android.widget.TextView>(R.id.tvCategoriaDetalle).text= categoriaNombre
        findViewById<android.widget.TextView>(R.id.tvPrecioDetalle).text   = "$${".%.0f".format(precio)}"
        findViewById<android.widget.TextView>(R.id.tvDescripcionDetalle).text = desc.ifEmpty { "Sin descripción" }

        // Botón regresar
        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        // Botón hacer pregunta: abre un diálogo (el formulario inline no está en el nuevo layout)
        val btnHacerPregunta = findViewById<Button?>(R.id.btnHacerPregunta)
        btnHacerPregunta?.setOnClickListener { mostrarDialogoPregunta() }
    }

    private fun mostrarDialogoPregunta() {
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
                if (idUsuario.isEmpty()) {
                    Toast.makeText(this, "Error de sesión", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val fecha = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date())
                val preguntaReq = com.example.myapplication.model.Pregunta(
                    idUsuario      = idUsuario,
                    codigoProducto = codigoProducto,
                    pregunta       = texto,
                    fecha          = fecha
                )
                api.agregarPregunta(token, preguntaReq).enqueue(object : retrofit2.Callback<Void> {
                    override fun onResponse(call: retrofit2.Call<Void>, response: retrofit2.Response<Void>) {
                        if (response.isSuccessful) {
                            Toast.makeText(this@DetalleProductoActivity, "¡Pregunta enviada!", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(this@DetalleProductoActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: retrofit2.Call<Void>, t: Throwable) {
                        Toast.makeText(this@DetalleProductoActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                    }
                })
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}
