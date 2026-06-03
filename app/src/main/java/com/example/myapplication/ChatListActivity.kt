package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Chat
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ChatListActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var recyclerChats: RecyclerView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_list)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        recyclerChats = findViewById(R.id.recyclerChats)
        progressBar = findViewById(R.id.progressBarChats)
        val btnRegresar = findViewById<Button>(R.id.btnRegresarChats)

        recyclerChats.layoutManager = LinearLayoutManager(this)

        btnRegresar.setOnClickListener { finish() }

        cargarChats()
    }

    private fun cargarChats() {
        progressBar.visibility = View.VISIBLE
        val api = ApiClient.retrofit.create(ApiService::class.java)

        api.getMisChats(token).enqueue(object : Callback<List<Chat>> {
            override fun onResponse(call: Call<List<Chat>>, response: Response<List<Chat>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful && response.body() != null) {
                    val chats = response.body()!!
                    val adapter = ChatAdapter(chats) { chat ->
                        val intent = Intent(this@ChatListActivity, ChatDetailActivity::class.java)
                        intent.putExtra("CODIGO_CHAT", chat.codigoChat)
                        intent.putExtra("ID_SERVICIO", chat.idServicio)
                        startActivity(intent)
                    }
                    recyclerChats.adapter = adapter
                } else {
                    Toast.makeText(this@ChatListActivity, "No se pudieron cargar los chats.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Chat>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@ChatListActivity, "Error de red.", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
