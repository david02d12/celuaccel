package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Chat
import com.example.myapplication.model.Cliente
import com.example.myapplication.model.Servicio
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ChatListActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var userId: String
    private var userRole: Int = 2
    private var idServicioIntent: Int = -1
    private lateinit var recyclerChats: RecyclerView

    // Diccionarios en memoria para almacenar las relaciones indexadas
    private val mapaClientes = mutableMapOf<String, String>() // ID_Usuario -> Nombre
    private val mapaServicios = mutableMapOf<Int, String>()   // ID_Servicio -> Movil_Nombre

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_list)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token    = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        userId   = sharedPref.getString("user_id", "") ?: ""
        userRole = sharedPref.getInt("user_role", 2)
        idServicioIntent = intent.getIntExtra("ID_SERVICIO", -1)

        recyclerChats = findViewById(R.id.recyclerChats)
        val btnRegresar = findViewById<Button>(R.id.btnRegresar)

        recyclerChats.layoutManager = LinearLayoutManager(this)
        btnRegresar.setOnClickListener { finish() }

        // Primero precargamos las dependencias de nombres, y dentro de ellas llamamos a los chats
        cargarDatosDeSoporte()
    }

    private fun cargarDatosDeSoporte() {
        val api = ApiClient.retrofit.create(ApiService::class.java)

        // 1. Traer Clientes para indexar nombres
        api.getClientes(token).enqueue(object : Callback<List<Cliente>> {
            override fun onResponse(call: Call<List<Cliente>>, response: Response<List<Cliente>>) {
                if (response.isSuccessful && response.body() != null) {
                    response.body()!!.forEach { cliente ->
                        mapaClientes[cliente.idUsuario] = cliente.nombre
                    }
                }
                // 2. Anidamos la carga de servicios para asegurar orden
                cargarServiciosYSeguir(api)
            }
            override fun onFailure(call: Call<List<Cliente>>, t: Throwable) {
                cargarServiciosYSeguir(api) // Continuar aunque falle para no congelar la pantalla
            }
        })
    }

    private fun cargarServiciosYSeguir(api: ApiService) {
        api.getServicios(token).enqueue(object : Callback<List<Servicio>> {
            override fun onResponse(call: Call<List<Servicio>>, response: Response<List<Servicio>>) {
                if (response.isSuccessful && response.body() != null) {
                    response.body()!!.forEach { servicio ->
                        servicio.idServicio?.let { id ->
                            mapaServicios[id] = servicio.movilNombre
                        }
                    }
                }
                // 3. Ya con los mapas listos, cargamos la lista de chats final
                cargarChats()
            }
            override fun onFailure(call: Call<List<Servicio>>, t: Throwable) {
                cargarChats()
            }
        })
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

        api.crearChat(token, nuevoChat).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    cargarDatosDeSoporte() // Recargar estructura completa
                } else {
                    Toast.makeText(this@ChatListActivity, "Error al iniciar el chat", Toast.LENGTH_SHORT).show()
                    idServicioIntent = -1
                    cargarDatosDeSoporte()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@ChatListActivity, "Error de red", Toast.LENGTH_SHORT).show()
                idServicioIntent = -1
                cargarDatosDeSoporte()
            }
        })
    }

    private fun abrirDetalleChat(chat: Chat) {
        val intent = Intent(this, ChatDetailActivity::class.java)
        intent.putExtra("CODIGO_CHAT", chat.codigoChat)
        intent.putExtra("ID_SERVICIO", chat.idServicio)
        startActivity(intent)
        finish()
    }

    private fun mostrarLista(chats: List<Chat>) {
        // Pasamos la lista de chats junto con nuestros mapas relacionales de memoria
        val adapter = ChatAdapter(chats, mapaClientes, mapaServicios) { chat ->
            val intent = Intent(this@ChatListActivity, ChatDetailActivity::class.java)
            intent.putExtra("CODIGO_CHAT", chat.codigoChat)
            intent.putExtra("ID_SERVICIO", chat.idServicio)
            startActivity(intent)
        }
        recyclerChats.adapter = adapter
    }
}