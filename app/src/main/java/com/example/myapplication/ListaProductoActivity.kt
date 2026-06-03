package com.example.myapplication

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
import com.example.myapplication.model.Producto
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ListaProductoActivity : AppCompatActivity() {
    private lateinit var productoAdapter: ProductoAdapter
    private val listaProductos = mutableListOf<Producto>()
    private lateinit var vistaProductos: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var btnRegresar: Button
    private lateinit var token: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lista_productos)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        vistaProductos = findViewById(R.id.vistaProductos)
        progressBar = findViewById(R.id.progressBar)
        btnRegresar = findViewById(R.id.btnRegresar)

        vistaProductos.layoutManager = LinearLayoutManager(this)

        cargarProductos()

        btnRegresar.setOnClickListener {
            finish()
        }
    }

    private fun cargarProductos() {
        progressBar.visibility = View.VISIBLE
        val apiService = ApiClient.retrofit.create(ApiService::class.java)

        apiService.getProductos(token).enqueue(object : Callback<List<Producto>> {
            override fun onResponse(call: Call<List<Producto>>, response: Response<List<Producto>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful) {
                    listaProductos.clear()
                    response.body()?.let { listaProductos.addAll(it) }

                    productoAdapter = ProductoAdapter(listaProductos)
                    vistaProductos.adapter = productoAdapter

                    if (listaProductos.isEmpty()) {
                        Toast.makeText(this@ListaProductoActivity, "No hay productos.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@ListaProductoActivity, "Error (${response.code()})", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<List<Producto>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@ListaProductoActivity, "Fallo de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
