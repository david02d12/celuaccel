package com.example.myapplication

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
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
    private lateinit var etMensaje: EditText
    private lateinit var api: ApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_detail)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token     = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        idUsuario = sharedPref.getString("user_id", "") ?: ""

        api = ApiClient.retrofit.create(ApiService::class.java)

        codigoChat = intent.getIntExtra("CODIGO_CHAT", -1)
        idServicio = intent.getIntExtra("ID_SERVICIO", -1)

        // IDs del nuevo activity_chat_detail.xml
        val tvNombreChat = findViewById<TextView>(R.id.tvNombreChat)
        tvNombreChat.text = "Chat Servicio #$idServicio"

        recyclerMensajes = findViewById(R.id.recyclerMensajes)
        etMensaje        = findViewById(R.id.etMensaje)

        val btnRegresar  = findViewById<Button>(R.id.btnRegresar)
        val btnEnviar    = findViewById<Button>(R.id.btnEnviarMensaje)

        recyclerMensajes.layoutManager = LinearLayoutManager(this)
        adapter = MensajeAdapter(emptyList(), idUsuario) { idMensaje ->
            confirmarEliminarMensaje(idMensaje)
        }
        recyclerMensajes.adapter = adapter

        btnRegresar.setOnClickListener { finish() }

        btnEnviar.setOnClickListener {
            val mensajeTexto = etMensaje.text.toString().trim()
            if (mensajeTexto.isNotEmpty()) {
                enviarMensaje(mensajeTexto)
            }
        }

        if (codigoChat != -1) cargarMensajes()
        else Toast.makeText(this, "Código de chat no válido.", Toast.LENGTH_SHORT).show()
    }

    private fun cargarMensajes() {
        api.getMensajesPorChat(token, codigoChat).enqueue(object : Callback<List<Mensaje>> {
            override fun onResponse(call: Call<List<Mensaje>>, response: Response<List<Mensaje>>) {
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
                Toast.makeText(this@ChatDetailActivity, "Fallo de red.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun enviarMensaje(texto: String) {
        val fechaActual = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val mensajeReq = Mensaje(
            codigoChat   = codigoChat,
            idUsuario    = idUsuario,
            mensaje      = texto,
            fechaMensaje = fechaActual
        )
        api.enviarMensaje(token, mensajeReq).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    etMensaje.text.clear()
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

    private fun confirmarEliminarMensaje(idMensaje: Int) {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Eliminar Mensaje")
            .setMessage("¿Estás seguro de eliminar este mensaje?")
            .setPositiveButton("Eliminar") { _, _ ->
                api.eliminarMensaje(token, idMensaje).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) cargarMensajes()
                        else Toast.makeText(this@ChatDetailActivity, "Error al eliminar (${response.code()})", Toast.LENGTH_SHORT).show()
                    }
                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        Toast.makeText(this@ChatDetailActivity, "Fallo de red.", Toast.LENGTH_SHORT).show()
                    }
                })
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }


    private class MensajeAdapter(
        private var mensajes: List<Mensaje>,
        private val idUsuarioActual: String,
        private val onEliminar: (Int) -> Unit
    ) : RecyclerView.Adapter<MensajeAdapter.ViewHolder>() {

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {

            val bubbleMio:    View     = view.findViewById(R.id.bubbleMio)
            val tvMensajeMio: TextView = view.findViewById(R.id.tvMensajeMio)
            val tvHoraMio:    TextView = view.findViewById(R.id.tvHoraMio)

            val bubbleOtro:    View     = view.findViewById(R.id.bubbleOtro)
            val tvMensajeOtro: TextView = view.findViewById(R.id.tvMensajeOtro)
            val tvHoraOtro:    TextView = view.findViewById(R.id.tvHoraOtro)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_mensaje, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val msg   = mensajes[position]
            val esMio = msg.idUsuario == idUsuarioActual


            val hora = msg.fechaMensaje.let {
                if (it.contains("T")) it.substringAfter("T").take(5) else it.takeLast(5)
            }

            if (esMio) {
                holder.bubbleMio.visibility   = View.VISIBLE
                holder.bubbleOtro.visibility  = View.GONE
                holder.tvMensajeMio.text      = msg.mensaje
                holder.tvHoraMio.text         = hora
                holder.bubbleMio.setOnLongClickListener {
                    msg.codigoMensaje?.let { id -> onEliminar(id) }
                    true
                }
            } else {
                holder.bubbleMio.visibility   = View.GONE
                holder.bubbleOtro.visibility  = View.VISIBLE
                holder.tvMensajeOtro.text     = msg.mensaje
                holder.tvHoraOtro.text        = hora
            }
        }

        override fun getItemCount(): Int = mensajes.size

        fun actualizarLista(nuevaLista: List<Mensaje>) {
            mensajes = nuevaLista
            notifyDataSetChanged()
        }
    }
}
