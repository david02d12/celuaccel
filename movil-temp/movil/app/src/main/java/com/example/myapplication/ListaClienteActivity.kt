package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
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

    private lateinit var vistaClientes: RecyclerView
    private lateinit var btnRegresar: Button
    private lateinit var etBuscarCliente: EditText
    private lateinit var tvTotalClientes: TextView
    private lateinit var token: String

    // Listas para el control de filtros locales en tiempo real
    private val listaOriginal = mutableListOf<Cliente>()
    private val listaFiltrada = mutableListOf<Cliente>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lista_clientes)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        // Vincular los IDs exactos de tu XML
        vistaClientes = findViewById(R.id.recyclerClientes)
        btnRegresar = findViewById(R.id.btnRegresarListaClientes) // Ajustado al XML creado
        etBuscarCliente = findViewById(R.id.etBuscarCliente)
        tvTotalClientes = findViewById(R.id.tvTotalClientes)

        vistaClientes.layoutManager = LinearLayoutManager(this)

        // Configurar la escucha del buscador por texto
        etBuscarCliente.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filtrarClientes(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        btnRegresar.setOnClickListener {
            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        cargarClientes() // Recarga los datos al volver al activity si editaste algo
    }

    private fun cargarClientes() {
        val apiService = ApiClient.retrofit.create(ApiService::class.java)

        apiService.getClientes(token).enqueue(object : Callback<List<Cliente>> {
            override fun onResponse(call: Call<List<Cliente>>, response: Response<List<Cliente>>) {
                if (response.isSuccessful) {
                    listaOriginal.clear()
                    response.body()?.let {
                        listaOriginal.addAll(it)
                    }

                    // Ejecuta el filtrado inicial (que pintará a todos la primera vez)
                    filtrarClientes(etBuscarCliente.text.toString())

                    if (listaOriginal.isEmpty()) {
                        Toast.makeText(this@ListaClienteActivity, "No hay Clientes registrados.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Log.d("API_ERROR", "Error en respuesta: ${response.code()} | ${response.errorBody()?.string()}")
                    Toast.makeText(this@ListaClienteActivity, "Error de autenticación o del servidor (${response.code()})", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<List<Cliente>>, t: Throwable) {
                Log.e("RETROFIT_ERROR", "Fallo de conexión o parseo: ${t.message}")
                Toast.makeText(this@ListaClienteActivity, "Fallo de conexión de red", Toast.LENGTH_SHORT).show()
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

        // Actualizar la etiqueta del total con los resultados actuales
        tvTotalClientes.text = "${listaFiltrada.size} clientes registrados"

        // ── SOLUCIÓN AL ERROR: Aquí se inyecta la Opción A con el onClick resuelto ──
        vistaClientes.adapter = ClienteAdapter(listaFiltrada) { clienteSeleccionado ->
            val intent = Intent(this@ListaClienteActivity, FormularioClienteActivity::class.java)
            intent.putExtra("ID_CLIENTE_SELECCIONADO", clienteSeleccionado.idUsuario)
            startActivity(intent)
        }
    }
}