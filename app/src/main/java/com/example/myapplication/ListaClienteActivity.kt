package com.example.myapplication

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
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

class ListaClienteActivity : AppCompatActivity() {
    private lateinit var clienteAdapter: ClienteAdapter
    private val listaClientes = mutableListOf<Cliente>()
    private lateinit var vistaClientes: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var btnRegresar: Button
    private lateinit var token: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lista_clientes)


        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"


        vistaClientes = findViewById(R.id.vistaClientes)
        progressBar = findViewById(R.id.progressBar)
        btnRegresar = findViewById(R.id.btnRegresar)


        vistaClientes.layoutManager = LinearLayoutManager(this)


        cargarClientes()


        btnRegresar.setOnClickListener {
            finish()
        }
    }

    private fun cargarClientes() {
        progressBar.visibility = View.VISIBLE

        val apiService = ApiClient.retrofit.create(ApiService::class.java)


        apiService.getClientes(token).enqueue(object : Callback<List<Cliente>> {
            override fun onResponse(call: Call<List<Cliente>>, response: Response<List<Cliente>>) {
                progressBar.visibility = View.GONE

                if (response.isSuccessful) {
                    listaClientes.clear()
                    response.body()?.let {
                        listaClientes.addAll(it)
                    }


                    clienteAdapter = ClienteAdapter(listaClientes)
                    vistaClientes.adapter = clienteAdapter

                    if (listaClientes.isEmpty()) {
                        Toast.makeText(this@ListaClienteActivity, "No hay Clientes registrados.", Toast.LENGTH_SHORT).show()
                    }
                } else {

                    Log.d("API_ERROR", "Error en respuesta: ${response.code()} | ${response.errorBody()?.string()}")
                    Toast.makeText(this@ListaClienteActivity, "Error de autenticación o del servidor (${response.code()})", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<List<Cliente>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Log.e("RETROFIT_ERROR", "Fallo de conexión o parseo: ${t.message}")
                Toast.makeText(this@ListaClienteActivity, "Fallo de conexión de red", Toast.LENGTH_SHORT).show()
            }
        })
    }
}