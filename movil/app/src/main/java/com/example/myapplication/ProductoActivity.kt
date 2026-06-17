package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Categoria
import com.example.myapplication.model.Producto
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProductoActivity : AppCompatActivity() {

    private lateinit var token: String
    private var categoriasLista: List<Categoria> = emptyList()
    private var productoEnEdicion: Producto? = null

    // Views
    private lateinit var scrollForm: ScrollView
    private lateinit var recyclerView: RecyclerView
    private lateinit var etNombre: EditText
    private lateinit var etPrecio: EditText
    private lateinit var etStock: EditText
    private lateinit var spinnerCategoria: Spinner
    private lateinit var btnNuevo: Button
    private lateinit var btnGuardar: Button
    private lateinit var btnCancelar: Button

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_productos)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        scrollForm       = findViewById(R.id.scrollFormProducto)
        recyclerView     = findViewById(R.id.recyclerProductos)
        etNombre         = findViewById(R.id.etNombreProducto)
        etPrecio         = findViewById(R.id.etPrecioProducto)
        etStock          = findViewById(R.id.etStockProducto)
        spinnerCategoria = findViewById(R.id.spinnerCategoriaProducto)
        btnNuevo         = findViewById(R.id.btnNuevoProducto)
        btnGuardar       = findViewById(R.id.btnGuardarProducto)
        btnCancelar      = findViewById(R.id.btnCancelarProducto)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // Botón regresar
        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        // Mostrar formulario vacío para nuevo producto
        btnNuevo.setOnClickListener {
            productoEnEdicion = null
            limpiarFormulario()
            scrollForm.visibility = View.VISIBLE
            btnNuevo.visibility   = View.GONE
            etNombre.requestFocus()
        }

        btnCancelar.setOnClickListener {
            scrollForm.visibility = View.GONE
            btnNuevo.visibility   = View.VISIBLE
            productoEnEdicion     = null
        }

        btnGuardar.setOnClickListener { guardar() }

        cargarCategorias()
        cargarProductos()
    }

    private fun cargarCategorias() {
        api.getCategorias(token).enqueue(object : Callback<List<Categoria>> {
            override fun onResponse(call: Call<List<Categoria>>, response: Response<List<Categoria>>) {
                if (response.isSuccessful && response.body() != null) {
                    categoriasLista = response.body()!!
                    val adapter = ArrayAdapter(
                        this@ProductoActivity,
                        android.R.layout.simple_spinner_item,
                        categoriasLista.map { it.nombreCategoria }
                    )
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                    spinnerCategoria.adapter = adapter
                }
            }
            override fun onFailure(call: Call<List<Categoria>>, t: Throwable) {
                Toast.makeText(this@ProductoActivity, "Error al cargar categorías", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun cargarProductos() {
        api.getProductos(token).enqueue(object : Callback<List<Producto>> {
            override fun onResponse(call: Call<List<Producto>>, response: Response<List<Producto>>) {
                if (response.isSuccessful && response.body() != null) {
                    val lista = response.body()!!
                    recyclerView.adapter = ProductoAdapter(lista.toMutableList())
                }
            }
            override fun onFailure(call: Call<List<Producto>>, t: Throwable) {
                Toast.makeText(this@ProductoActivity, "Error cargando productos", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun guardar() {
        val nombre   = etNombre.text.toString().trim()
        val precio   = etPrecio.text.toString().toDoubleOrNull() ?: 0.0
        val cantidad = etStock.text.toString().toIntOrNull() ?: 0
        val catIdx   = spinnerCategoria.selectedItemPosition
        val idCat    = if (catIdx >= 0 && categoriasLista.isNotEmpty()) categoriasLista[catIdx].idCategoria else null

        if (nombre.isEmpty()) { etNombre.error = "Requerido"; return }

        val call: Call<Void> = if (productoEnEdicion != null) {
            val actualizado = productoEnEdicion!!.copy(nombre = nombre, precio = precio, cantidad = cantidad, idCategoria = idCat)
            api.actualizarProducto(token, actualizado)
        } else {
            val nuevo = Producto(codigoProducto = "", nombre = nombre, precio = precio, cantidad = cantidad, descripcion = null, imagen = null, idCategoria = idCat, activoCatalogo = 1)
            api.agregarProducto(token, nuevo)
        }

        call.enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    val msg = if (productoEnEdicion != null) "Producto actualizado" else "Producto guardado"
                    Toast.makeText(this@ProductoActivity, msg, Toast.LENGTH_SHORT).show()
                    scrollForm.visibility = View.GONE
                    btnNuevo.visibility   = View.VISIBLE
                    productoEnEdicion     = null
                    cargarProductos()
                } else {
                    Toast.makeText(this@ProductoActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@ProductoActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    fun editarProducto(producto: Producto) {
        productoEnEdicion = producto
        etNombre.setText(producto.nombre)
        etPrecio.setText(producto.precio.toString())
        etStock.setText(producto.cantidad.toString())
        val catIdx = categoriasLista.indexOfFirst { it.idCategoria == producto.idCategoria }
        if (catIdx >= 0) spinnerCategoria.setSelection(catIdx)
        scrollForm.visibility = View.VISIBLE
        btnNuevo.visibility   = View.GONE
        etNombre.requestFocus()
    }

    fun eliminarProducto(producto: Producto) {
        AlertDialog.Builder(this)
            .setTitle("Eliminar Producto")
            .setMessage("¿Eliminar '${producto.nombre}'?")
            .setPositiveButton("Eliminar") { _, _ ->
                api.deleteProducto(token, producto.codigoProducto).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            Toast.makeText(this@ProductoActivity, "Producto eliminado", Toast.LENGTH_SHORT).show()
                            cargarProductos()
                        } else {
                            Toast.makeText(this@ProductoActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        Toast.makeText(this@ProductoActivity, "Error de red", Toast.LENGTH_SHORT).show()
                    }
                })
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun limpiarFormulario() {
        etNombre.text.clear()
        etPrecio.text.clear()
        etStock.text.clear()
    }
}
