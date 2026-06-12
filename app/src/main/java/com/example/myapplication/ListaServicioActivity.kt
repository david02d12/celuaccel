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
import com.example.myapplication.model.Servicio
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ListaServicioActivity : AppCompatActivity() {
    private lateinit var servicioAdapter: ServicioAdapter
    private val listaServicios = mutableListOf<Servicio>()
    private lateinit var vistaServicios: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var btnRegresar: Button
    private lateinit var token: String
    private lateinit var userId: String
    private var userRole: Int = 2

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lista_servicios)


        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        userId = sharedPref.getString("user_id", "") ?: ""
        userRole = sharedPref.getInt("user_role", 2)


        vistaServicios = findViewById(R.id.vistaServicios)
        progressBar = findViewById(R.id.progressBarServicios)
        btnRegresar = findViewById(R.id.btnRegresarServicios)

        vistaServicios.layoutManager = LinearLayoutManager(this)

        cargarServicios()

        btnRegresar.setOnClickListener {
            finish()
        }
    }

    private fun cargarServicios() {
        progressBar.visibility = View.VISIBLE

        val apiService = ApiClient.retrofit.create(ApiService::class.java)

        val call = if (userRole == 2) {
            apiService.getMisServicios(token)  // el backend identifica al usuario por token
        } else {
            apiService.getServicios(token)
        }

        call.enqueue(object : Callback<List<Servicio>> {
            override fun onResponse(call: Call<List<Servicio>>, response: Response<List<Servicio>>) {
                progressBar.visibility = View.GONE

                if (response.isSuccessful) {
                    listaServicios.clear()
                    response.body()?.let {
                        listaServicios.addAll(it)
                    }

                    servicioAdapter = ServicioAdapter(listaServicios)
                    vistaServicios.adapter = servicioAdapter

                    if (listaServicios.isEmpty()) {
                        Toast.makeText(this@ListaServicioActivity, "No hay servicios registrados.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Log.d("API_ERROR", "Error: ${response.code()} | ${response.errorBody()?.string()}")
                    Toast.makeText(this@ListaServicioActivity, "Error al obtener servicios (${response.code()})", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<List<Servicio>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Log.e("RETROFIT_ERROR", "Fallo: ${t.message}")
                Toast.makeText(this@ListaServicioActivity, "Fallo de conexión de red", Toast.LENGTH_SHORT).show()
            }
        })
    }
}