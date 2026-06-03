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

        findViewById<TextView>(R.id.txtDetalleNombre).text = nombre
        findViewById<TextView>(R.id.txtDetalleCodigo).text = codigoProducto
        findViewById<TextView>(R.id.txtDetalleCategoria).text = categoriaNombre
        findViewById<TextView>(R.id.txtDetallePrecio).text = "$$precio"
        findViewById<TextView>(R.id.txtDetalleStock).text = if (stock > 0) "$stock unidades" else "Sin stock"
        findViewById<TextView>(R.id.txtDetalleDescripcion).text = desc

        val layoutPregunta = findViewById<LinearLayout>(R.id.layoutPregunta)
        val txtPregunta = findViewById<EditText>(R.id.txtPregunta)
        val btnHacerPregunta = findViewById<Button>(R.id.btnHacerPregunta)
        val btnCancelarPregunta = findViewById<Button>(R.id.btnCancelarPregunta)
        val btnEnviarPregunta = findViewById<Button>(R.id.btnEnviarPregunta)
        val btnRegresar = findViewById<Button>(R.id.btnRegresarDetalle)

        btnHacerPregunta.setOnClickListener {
            layoutPregunta.visibility = View.VISIBLE
            btnHacerPregunta.visibility = View.GONE
        }

        btnCancelarPregunta.setOnClickListener {
            layoutPregunta.visibility = View.GONE
            btnHacerPregunta.visibility = View.VISIBLE
            txtPregunta.text.clear()
        }

        btnEnviarPregunta.setOnClickListener {
            val preguntaTexto = txtPregunta.text.toString().trim()
            if (preguntaTexto.isEmpty()) {
                Toast.makeText(this, "Escribe una pregunta", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (idUsuario.isEmpty()) {
                Toast.makeText(this, "Error de sesión. No se encontró el usuario.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val fechaActual = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

            val preguntaReq = Pregunta(
                idUsuario = idUsuario,
                codigoProducto = codigoProducto,
                pregunta = preguntaTexto,
                fecha = fechaActual
            )

            api.agregarPregunta(token, preguntaReq).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@DetalleProductoActivity, "¡Pregunta enviada!", Toast.LENGTH_SHORT).show()
                        layoutPregunta.visibility = View.GONE
                        btnHacerPregunta.visibility = View.VISIBLE
                        txtPregunta.text.clear()
                    } else {
                        Toast.makeText(this@DetalleProductoActivity, "Error al enviar: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@DetalleProductoActivity, "Fallo de conexión", Toast.LENGTH_SHORT).show()
                }
            })
        }

        btnRegresar.setOnClickListener { finish() }
    }
}
