package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Servicio
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class SolicitarServicioActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var idUsuarioAutenticado: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_solicitar_servicio)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        idUsuarioAutenticado = sharedPref.getString("user_id", "") ?: ""

        // IDs del nuevo activity_solicitar_servicio.xml
        val etDispositivo   = findViewById<EditText>(R.id.etDispositivoSolicitud)
        val etDescripcion   = findViewById<EditText>(R.id.etDescripcionSolicitud)
        val btnEnviar       = findViewById<Button>(R.id.btnEnviarSolicitud)
        val btnRegresar     = findViewById<Button>(R.id.btnRegresar)

        val api = ApiClient.retrofit.create(ApiService::class.java)

        btnEnviar.setOnClickListener {
            val desc   = etDescripcion.text.toString().trim()
            val marca  = etDispositivo.text.toString().trim()

            if (desc.isEmpty() || marca.isEmpty()) {
                Toast.makeText(this, "Por favor, ingresa el problema y el dispositivo.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (idUsuarioAutenticado.isEmpty()) {
                Toast.makeText(this, "Error de sesión.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val fechaActual = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

            val nuevoServicio = Servicio(
                descripcion         = desc,
                idUsuario           = idUsuarioAutenticado,
                precio              = 0.0,
                movilNombre         = marca,
                movilEspecificacion = "",
                fecha               = fechaActual,
                etapa               = 0
            )

            api.agregarServicio(token, nuevoServicio).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@SolicitarServicioActivity, "¡Solicitud enviada con éxito!", Toast.LENGTH_LONG).show()
                        etDescripcion.text.clear()
                        etDispositivo.text.clear()
                    } else {
                        Toast.makeText(this@SolicitarServicioActivity, "Error al enviar: ${response.code()}", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@SolicitarServicioActivity, "Error de conexión.", Toast.LENGTH_SHORT).show()
                }
            })
        }

        btnRegresar.setOnClickListener { finish() }
    }
}
