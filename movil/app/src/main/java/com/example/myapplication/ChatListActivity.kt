package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Chat
import com.example.myapplication.model.ChatResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ChatListActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var userId: String
    private var userRole: Int = 2
    private var idServicioIntent: Int = -1
    private lateinit var recyclerChats: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_list)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token    = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        userId   = sharedPref.getString("user_id", "") ?: ""
        userRole = sharedPref.getInt("user_role", 2)
        idServicioIntent = intent.getIntExtra("ID_SERVICIO", -1)

        // IDs del nuevo activity_chat_list.xml
        recyclerChats = findViewById(R.id.recyclerChats)
        val btnRegresar = findViewById<Button>(R.id.btnRegresar)

        recyclerChats.layoutManager = LinearLayoutManager(this)
        btnRegresar.setOnClickListener { finish() }

        cargarChats()
    }

    private fun cargarChats() {
        val api = ApiClient.retrofit.create(ApiService::class.java)

        val call: Call<List<Chat>> = if (userRole == 2) {
            api.getMisChats(token)
        } else {
            api.getChats(token)
        }

        call.enqueue(object : Callback<List<Chat>> {
            override fun onResponse(call: Call<List<Chat>>, response: Response<List<Chat>>) {
                if (response.isSuccessful && response.body() != null) {
                    val chats = response.body()!!

                    if (idServicioIntent != -1) {
                        val chatExistente = chats.find { it.idServicio == idServicioIntent }
                        if (chatExistente != null) {
                            abrirDetalleChat(chatExistente)
                            return
                        } else if (userRole == 2) {
                            crearChat(idServicioIntent)
                            return
                        }
                    }
                    mostrarLista(chats)
                } else {
                    Toast.makeText(this@ChatListActivity, "No se pudieron cargar los chats.", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Chat>>, t: Throwable) {
                Toast.makeText(this@ChatListActivity, "Error de red.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun crearChat(idServicio: Int) {
        val api = ApiClient.retrofit.create(ApiService::class.java)
        val nuevoChat = Chat(idUsuario = userId, idServicio = idServicio)

        api.crearChat(token, nuevoChat).enqueue(object : Callback<ChatResponse> {
            override fun onResponse(call: Call<ChatResponse>, response: Response<ChatResponse>) {
                if (response.isSuccessful) {
                    cargarChats()
                } else {
                    Toast.makeText(this@ChatListActivity, "Error al iniciar el chat (${response.code()})", Toast.LENGTH_SHORT).show()
                    idServicioIntent = -1
                    cargarChats()
                }
            }
            override fun onFailure(call: Call<ChatResponse>, t: Throwable) {
                Toast.makeText(this@ChatListActivity, "Error de red al crear chat", Toast.LENGTH_SHORT).show()
                idServicioIntent = -1
                cargarChats()
            }
        })
    }

    private fun abrirDetalleChat(chat: Chat) {
        val intent = Intent(this, ChatDetailActivity::class.java)
        intent.putExtra("CODIGO_CHAT", chat.codigoChat)
        // idServicio puede ser null para chats de catálogo
        chat.idServicio?.let { intent.putExtra("ID_SERVICIO", it) }
        startActivity(intent)
        finish()
    }

    private fun mostrarLista(chats: List<Chat>) {
        val adapter = ChatAdapter(chats, userRole) { chat ->
            val intent = Intent(this@ChatListActivity, ChatDetailActivity::class.java)
            intent.putExtra("CODIGO_CHAT", chat.codigoChat)
            chat.idServicio?.let { intent.putExtra("ID_SERVICIO", it) }
            startActivity(intent)
        }
        recyclerChats.adapter = adapter
    }
}
