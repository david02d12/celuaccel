package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.ClienteAdapter
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Cliente
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ClienteActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var recyclerView: RecyclerView
    private lateinit var tvTotalClientes: TextView
    private lateinit var etBuscarCliente: EditText

    private var listaOriginal = listOf<Cliente>()
    private var listaFiltrada = mutableListOf<Cliente>()

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lista_clientes)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"

        recyclerView = findViewById(R.id.recyclerClientes)
        tvTotalClientes = findViewById(R.id.tvTotalClientes)
        etBuscarCliente = findViewById(R.id.etBuscarCliente)

        recyclerView.layoutManager = LinearLayoutManager(this)

        findViewById<Button>(R.id.btnRegresarListaClientes).setOnClickListener { finish() }

        etBuscarCliente.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filtrarClientes(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    override fun onResume() {
        super.onResume()
        obtenerClientesDelServidor()
    }

    private fun obtenerClientesDelServidor() {
        api.getClientes(token).enqueue(object : Callback<List<Cliente>> {
            override fun onResponse(call: Call<List<Cliente>>, response: Response<List<Cliente>>) {
                if (response.isSuccessful && response.body() != null) {
                    listaOriginal = response.body()!!
                    filtrarClientes(etBuscarCliente.text.toString())
                } else {
                    tvTotalClientes.text = "Error al leer datos"
                    Toast.makeText(this@ClienteActivity, "Código: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Cliente>>, t: Throwable) {
                tvTotalClientes.text = "Sin respuesta"
                Toast.makeText(this@ClienteActivity, "Fallo de comunicación de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun filtrarClientes(texto: String) {
        val consulta = texto.trim().lowercase()
        listaFiltrada.clear()

        for (c in listaOriginal) {
            if (consulta.isEmpty() ||
                c.nombre.lowercase().contains(consulta) ||
                c.idUsuario.contains(consulta) ||
                c.correo.lowercase().contains(consulta)) {
                listaFiltrada.add(c)
            }
        }

        tvTotalClientes.text = "${listaFiltrada.size} clientes registrados"

        recyclerView.adapter = ClienteAdapter(listaFiltrada) { clienteSeleccionado ->
            val intent = Intent(this@ClienteActivity, FormularioClienteActivity::class.java)
            intent.putExtra("ID_CLIENTE_SELECCIONADO", clienteSeleccionado.idUsuario)
            startActivity(intent)
        }
    }
}