package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Chat
import com.example.myapplication.model.ChatResponse
import com.example.myapplication.model.Servicio
import com.example.myapplication.model.ServicioResponse
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

            api.agregarServicio(token, nuevoServicio).enqueue(object : Callback<ServicioResponse> {
                override fun onResponse(call: Call<ServicioResponse>, response: Response<ServicioResponse>) {
                    if (response.isSuccessful) {
                        val servicioId = response.body()?.id
                        if (servicioId != null) {
                            crearChatParaServicio(servicioId, desc)
                            etDescripcion.text.clear()
                            etDispositivo.text.clear()
                        } else {
                            Toast.makeText(this@SolicitarServicioActivity, "¡Solicitud enviada con éxito!", Toast.LENGTH_LONG).show()
                            etDescripcion.text.clear()
                            etDispositivo.text.clear()
                        }
                    } else {
                        Toast.makeText(this@SolicitarServicioActivity, "Error al enviar: ${response.code()}", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<ServicioResponse>, t: Throwable) {
                    Toast.makeText(this@SolicitarServicioActivity, "Error de conexión.", Toast.LENGTH_SHORT).show()
                }
            })
        }

        btnRegresar.setOnClickListener { finish() }
    }

    private fun crearChatParaServicio(servicioId: Int, descripcion: String) {
        val api = ApiClient.retrofit.create(ApiService::class.java)
        val nuevoChat = Chat(idUsuario = idUsuarioAutenticado, idServicio = servicioId)

        api.crearChat(token, nuevoChat).enqueue(object : Callback<ChatResponse> {
            override fun onResponse(call: Call<ChatResponse>, response: Response<ChatResponse>) {
                if (response.isSuccessful) {
                    val chatId = response.body()?.id
                    if (chatId != null) {
                        val fechaActual = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                        val mensajeReq = com.example.myapplication.model.Mensaje(
                            codigoChat   = chatId,
                            idUsuario    = idUsuarioAutenticado,
                            mensaje      = "Solicitud de servicio: $descripcion",
                            fechaMensaje = fechaActual
                        )
                        api.enviarMensaje(token, mensajeReq).enqueue(object : Callback<Void> {
                            override fun onResponse(call: Call<Void>, resp: Response<Void>) {
                                val mensaje = if (resp.isSuccessful) {
                                    "¡Solicitud enviada! Se ha creado un chat para tu servicio."
                                } else {
                                    "¡Solicitud enviada! Chat creado."
                                }
                                androidx.appcompat.app.AlertDialog.Builder(this@SolicitarServicioActivity)
                                    .setTitle("Solicitud Exitosa")
                                    .setMessage(mensaje)
                                    .setPositiveButton("Abrir Chat") { _, _ ->
                                        val intent = Intent(this@SolicitarServicioActivity, ChatDetailActivity::class.java)
                                        intent.putExtra("CODIGO_CHAT", chatId)
                                        intent.putExtra("ID_SERVICIO", servicioId)
                                        startActivity(intent)
                                    }
                                    .setNegativeButton("Cerrar", null)
                                    .show()
                            }
                            override fun onFailure(call: Call<Void>, t: Throwable) {
                                Toast.makeText(this@SolicitarServicioActivity, "¡Solicitud enviada con chat!", Toast.LENGTH_LONG).show()
                            }
                        })
                    } else {
                        Toast.makeText(this@SolicitarServicioActivity, "¡Solicitud enviada con éxito!", Toast.LENGTH_LONG).show()
                    }
                } else {
                    Toast.makeText(this@SolicitarServicioActivity, "¡Solicitud enviada! No se pudo crear el chat automático.", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<ChatResponse>, t: Throwable) {
                Toast.makeText(this@SolicitarServicioActivity, "¡Solicitud enviada! Error de red al crear chat.", Toast.LENGTH_LONG).show()
            }
        })
    }
}
