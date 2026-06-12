package com.example.myapplication

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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
import com.example.myapplication.model.Mensaje
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ChatDetailActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var idUsuario: String
    private var codigoChat: Int = -1
    private var idServicio: Int = -1

    private lateinit var recyclerMensajes: RecyclerView
    private lateinit var adapter: MensajeAdapter
    private lateinit var progressBar: ProgressBar
    private lateinit var txtInput: EditText
    private lateinit var api: ApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_detail)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        idUsuario = sharedPref.getString("user_id", "") ?: ""

        api = ApiClient.retrofit.create(ApiService::class.java)

        codigoChat = intent.getIntExtra("CODIGO_CHAT", -1)
        idServicio = intent.getIntExtra("ID_SERVICIO", -1)

        val txtTitle = findViewById<TextView>(R.id.txtChatTitle)
        txtTitle.text = "Chat Servicio #$idServicio"

        recyclerMensajes = findViewById(R.id.recyclerMensajes)
        progressBar = findViewById(R.id.progressBarChatDetail)
        txtInput = findViewById(R.id.txtMensajeInput)

        val btnRegresar = findViewById<Button>(R.id.btnRegresarChatDetail)
        val btnEnviar = findViewById<Button>(R.id.btnEnviarMensaje)

        recyclerMensajes.layoutManager = LinearLayoutManager(this)
        adapter = MensajeAdapter(emptyList())
        recyclerMensajes.adapter = adapter

        btnRegresar.setOnClickListener { finish() }

        btnEnviar.setOnClickListener {
            val mensajeTexto = txtInput.text.toString().trim()
            if (mensajeTexto.isNotEmpty()) {
                enviarMensaje(mensajeTexto)
            }
        }

        if (codigoChat != -1) {
            cargarMensajes()
        } else {
            Toast.makeText(this, "Código de chat no válido.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun cargarMensajes() {
        progressBar.visibility = View.VISIBLE
        api.getMensajesPorChat(token, codigoChat).enqueue(object : Callback<List<Mensaje>> {
            override fun onResponse(call: Call<List<Mensaje>>, response: Response<List<Mensaje>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful && response.body() != null) {
                    adapter.actualizarLista(response.body()!!)
                    if (adapter.itemCount > 0) {
                        recyclerMensajes.scrollToPosition(adapter.itemCount - 1)
                    }
                } else {
                    Toast.makeText(this@ChatDetailActivity, "Error al cargar mensajes.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Mensaje>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@ChatDetailActivity, "Fallo de red.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun enviarMensaje(texto: String) {
        val fechaActual = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val mensajeReq = Mensaje(
            codigoChat = codigoChat,
            idUsuario = idUsuario,
            mensaje = texto,
            fecha = fechaActual
        )

        api.enviarMensaje(token, mensajeReq).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    txtInput.text.clear()
                    cargarMensajes()
                } else {
                    Toast.makeText(this@ChatDetailActivity, "Error al enviar mensaje.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@ChatDetailActivity, "Error de red al enviar.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    // Adaptador interno para los mensajes
    private class MensajeAdapter(
        private var mensajes: List<Mensaje>
    ) : RecyclerView.Adapter<MensajeAdapter.ViewHolder>() {

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val txtUsuario: TextView = view.findViewById(R.id.txtMensajeUsuario)
            val txtTexto: TextView = view.findViewById(R.id.txtMensajeTexto)
            val txtFecha: TextView = view.findViewById(R.id.txtMensajeFecha)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_mensaje, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val msg = mensajes[position]
            holder.txtUsuario.text = msg.dueno ?: msg.idUsuario
            holder.txtTexto.text   = msg.mensaje
            holder.txtFecha.text   = msg.fechaMensaje
        }

        override fun getItemCount(): Int = mensajes.size

        fun actualizarLista(nuevaLista: List<Mensaje>) {
            mensajes = nuevaLista
            notifyDataSetChanged()
        }
    }
}
