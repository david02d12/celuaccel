package com.example.myapplication

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Cliente
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ClienteActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var recyclerView: RecyclerView
    private lateinit var etBuscar: EditText
    private lateinit var btnRegresar: Button

    private var listaCompleta = listOf<Cliente>()
    private lateinit var adapter: ClienteAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_clientes)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        recyclerView = findViewById(R.id.recyclerClientes)
        etBuscar     = findViewById(R.id.etBuscarCliente)
        btnRegresar  = findViewById(R.id.btnRegresar)

        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = ClienteAdapter(mutableListOf())
        recyclerView.adapter = adapter

        btnRegresar.setOnClickListener { finish() }

        etBuscar.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { filtrar(s.toString()) }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        cargarClientes()
    }

    private fun cargarClientes() {
        val api = ApiClient.retrofit.create(ApiService::class.java)
        api.getClientes(token).enqueue(object : Callback<List<Cliente>> {
            override fun onResponse(call: Call<List<Cliente>>, response: Response<List<Cliente>>) {
                if (response.isSuccessful && response.body() != null) {
                    listaCompleta = response.body()!!
                    filtrar(etBuscar.text.toString())
                } else {
                    Log.d("API_ERROR", "Error: ${response.code()} | ${response.errorBody()?.string()}")
                    Toast.makeText(this@ClienteActivity, "Error al cargar usuarios (${response.code()})", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<List<Cliente>>, t: Throwable) {
                Log.e("RETROFIT_ERROR", "Fallo: ${t.message}")
                Toast.makeText(this@ClienteActivity, "Fallo de conexión de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun filtrar(query: String) {
        val q = query.lowercase().trim()
        val filtrados = if (q.isEmpty()) {
            listaCompleta
        } else {
            listaCompleta.filter {
                it.nombre.lowercase().contains(q) || it.idUsuario.lowercase().contains(q)
            }
        }
        adapter = ClienteAdapter(filtrados.toMutableList())
        recyclerView.adapter = adapter
    }
}