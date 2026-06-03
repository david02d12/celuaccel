package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Categoria
import com.example.myapplication.model.Producto
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CatalogoActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var api: ApiService

    private var todosLosProductos: List<Producto> = emptyList()
    private var categorias: List<Categoria> = emptyList()

    private lateinit var recyclerCatalogo: RecyclerView
    private lateinit var adapter: CatalogoAdapter
    private lateinit var progressBar: ProgressBar
    private lateinit var txtBuscar: EditText
    private lateinit var spinnerCategoria: Spinner

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_catalogo)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        api = ApiClient.retrofit.create(ApiService::class.java)

        recyclerCatalogo = findViewById(R.id.recyclerCatalogo)
        progressBar = findViewById(R.id.progressBarCatalogo)
        txtBuscar = findViewById(R.id.txtBuscarCatalogo)
        spinnerCategoria = findViewById(R.id.spinnerCategoriaCatalogo)
        val btnRegresar = findViewById<Button>(R.id.btnRegresarCatalogo)

        recyclerCatalogo.layoutManager = GridLayoutManager(this, 2)
        adapter = CatalogoAdapter(emptyList(), emptyList()) { producto ->
            abrirDetalle(producto)
        }
        recyclerCatalogo.adapter = adapter

        btnRegresar.setOnClickListener { finish() }

        cargarDatos()

        txtBuscar.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { filtrarProductos() }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        spinnerCategoria.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                filtrarProductos()
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun cargarDatos() {
        progressBar.visibility = View.VISIBLE
        
        api.getCategorias(token).enqueue(object : Callback<List<Categoria>> {
            override fun onResponse(call: Call<List<Categoria>>, response: Response<List<Categoria>>) {
                if (response.isSuccessful && response.body() != null) {
                    categorias = response.body()!!
                    val nombresCat = mutableListOf("Todas las categorías")
                    nombresCat.addAll(categorias.map { it.nombreCategoria })
                    
                    val spinnerAdapter = ArrayAdapter(this@CatalogoActivity, android.R.layout.simple_spinner_item, nombresCat)
                    spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                    spinnerCategoria.adapter = spinnerAdapter
                    
                    cargarProductos()
                } else {
                    progressBar.visibility = View.GONE
                    Toast.makeText(this@CatalogoActivity, "Error cargando categorías", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Categoria>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@CatalogoActivity, "Fallo de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun cargarProductos() {
        api.getProductos(token).enqueue(object : Callback<List<Producto>> {
            override fun onResponse(call: Call<List<Producto>>, response: Response<List<Producto>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful && response.body() != null) {
                    // RF009: Filtrar solo activos y con stock > 0
                    todosLosProductos = response.body()!!.filter { it.activoCatalogo == 1 && it.cantidad > 0 }
                    
                    // Actualizar adapter con la nueva lista y las categorías
                    adapter = CatalogoAdapter(todosLosProductos, categorias) { producto ->
                        abrirDetalle(producto)
                    }
                    recyclerCatalogo.adapter = adapter
                } else {
                    Toast.makeText(this@CatalogoActivity, "Error cargando productos", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Producto>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@CatalogoActivity, "Fallo de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun filtrarProductos() {
        val textoBusqueda = txtBuscar.text.toString().lowercase()
        val posCategoria = spinnerCategoria.selectedItemPosition
        
        val idCategoriaFiltro = if (posCategoria > 0) categorias[posCategoria - 1].idCategoria else null

        val filtrados = todosLosProductos.filter { prod ->
            val coincideNombre = prod.nombre.lowercase().contains(textoBusqueda) || 
                                 (prod.descripcion?.lowercase()?.contains(textoBusqueda) ?: false)
            val coincideCat = idCategoriaFiltro == null || prod.idCategoria == idCategoriaFiltro
            coincideNombre && coincideCat
        }
        
        adapter.actualizarLista(filtrados)
    }

    private fun abrirDetalle(producto: Producto) {
        val intent = Intent(this, DetalleProductoActivity::class.java).apply {
            putExtra("CODIGO", producto.codigoProducto)
            putExtra("NOMBRE", producto.nombre)
            putExtra("DESCRIPCION", producto.descripcion)
            putExtra("PRECIO", producto.precio)
            putExtra("CANTIDAD", producto.cantidad)
            putExtra("IMAGEN", producto.imagen)
            putExtra("IDCATEGORIA", producto.idCategoria ?: -1)
            
            val catNombre = categorias.find { it.idCategoria == producto.idCategoria }?.nombreCategoria ?: "Sin categoría"
            putExtra("CATEGORIANOMBRE", catNombre)
        }
        startActivity(intent)
    }
}
