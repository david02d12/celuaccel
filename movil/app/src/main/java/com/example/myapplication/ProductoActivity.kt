package com.example.myapplication

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
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

    // Lista completa en memoria para filtrar localmente
    private var listaCompleta: List<Producto> = emptyList()

    // Views — formulario
    private lateinit var scrollForm: ScrollView
    private lateinit var etCodigo: EditText
    private lateinit var etNombre: EditText
    private lateinit var etPrecio: EditText
    private lateinit var etStock: EditText
    private lateinit var etDescripcion: EditText      // NUEVO
    private lateinit var etImagen: EditText           // NUEVO
    private lateinit var spinnerCategoria: Spinner
    private lateinit var spinnerCatalogo: Spinner     // NUEVO: Activo_Catalogo
    private lateinit var btnNuevo: Button
    private lateinit var btnGuardar: Button
    private lateinit var btnCancelar: Button

    // Views — lista
    private lateinit var recyclerView: RecyclerView
    private lateinit var etBusqueda: EditText         // NUEVO

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_productos)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        // Binding
        scrollForm       = findViewById(R.id.scrollFormProducto)
        recyclerView     = findViewById(R.id.recyclerProductos)
        etCodigo         = findViewById(R.id.etCodigoProducto)
        etNombre         = findViewById(R.id.etNombreProducto)
        etPrecio         = findViewById(R.id.etPrecioProducto)
        etStock          = findViewById(R.id.etStockProducto)
        etDescripcion    = findViewById(R.id.etDescripcionProducto)
        etImagen         = findViewById(R.id.etImagenProducto)
        spinnerCategoria = findViewById(R.id.spinnerCategoriaProducto)
        spinnerCatalogo  = findViewById(R.id.spinnerActivoCatalogo)
        btnNuevo         = findViewById(R.id.btnNuevoProducto)
        btnGuardar       = findViewById(R.id.btnGuardarProducto)
        btnCancelar      = findViewById(R.id.btnCancelarProducto)
        etBusqueda       = findViewById(R.id.etBusquedaProducto)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // Spinner Activo_Catalogo: 0 = Oculto, 1 = Visible en catálogo
        val catalogoOpciones = listOf("Visible en catálogo", "Oculto del catálogo")
        val catalogoAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, catalogoOpciones)
        catalogoAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerCatalogo.adapter = catalogoAdapter

        // Botón regresar
        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        // Nuevo producto
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

        // Búsqueda en tiempo real
        etBusqueda.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filtrarLista(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

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
                    listaCompleta = response.body()!!
                    // Aplicar búsqueda activa al recargar
                    filtrarLista(etBusqueda.text.toString())
                } else {
                    Toast.makeText(this@ProductoActivity, "Error cargando productos (${response.code()})", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Producto>>, t: Throwable) {
                Toast.makeText(this@ProductoActivity, "Error cargando productos", Toast.LENGTH_SHORT).show()
            }
        })
    }

    /** Filtra la lista en memoria y actualiza el adapter */
    private fun filtrarLista(query: String) {
        val filtrada = if (query.isBlank()) {
            listaCompleta
        } else {
            val q = query.lowercase()
            listaCompleta.filter { p ->
                p.nombre.lowercase().contains(q) ||
                p.codigoProducto.lowercase().contains(q) ||
                (p.descripcion?.lowercase()?.contains(q) == true)
            }
        }
        recyclerView.adapter = ProductoAdapter(
            filtrada.toMutableList(),
            onEditar   = { producto -> editarProducto(producto) },
            onEliminar = { producto -> eliminarProducto(producto) }
        )
    }

    private fun guardar() {
        val codigoProducto = etCodigo.text.toString().trim()
        val nombre         = etNombre.text.toString().trim()
        val precio         = etPrecio.text.toString().toDoubleOrNull() ?: 0.0
        val cantidad       = etStock.text.toString().toIntOrNull() ?: 0
        val descripcion    = etDescripcion.text.toString().trim().ifBlank { null }
        val imagen         = etImagen.text.toString().trim().ifBlank { null }
        val catIdx         = spinnerCategoria.selectedItemPosition
        val idCat          = if (catIdx >= 0 && categoriasLista.isNotEmpty()) categoriasLista[catIdx].idCategoria else null
        val activoCatalogo = if (spinnerCatalogo.selectedItemPosition == 0) 1 else 0

        if (codigoProducto.isEmpty()) { etCodigo.error = "Requerido"; return }
        if (nombre.isEmpty())          { etNombre.error = "Requerido"; return }

        val call: Call<Void> = if (productoEnEdicion != null) {
            val actualizado = productoEnEdicion!!.copy(
                codigoProducto = codigoProducto,
                nombre         = nombre,
                precio         = precio,
                cantidad       = cantidad,
                descripcion    = descripcion,
                imagen         = imagen,
                idCategoria    = idCat,
                activoCatalogo = activoCatalogo
            )
            api.actualizarProducto(token, actualizado)
        } else {
            val nuevo = Producto(
                codigoProducto = codigoProducto,
                nombre         = nombre,
                precio         = precio,
                cantidad       = cantidad,
                descripcion    = descripcion,
                imagen         = imagen,
                idCategoria    = idCat,
                activoCatalogo = activoCatalogo
            )
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

    private fun editarProducto(producto: Producto) {
        productoEnEdicion = producto
        etCodigo.setText(producto.codigoProducto)
        etCodigo.isEnabled = false
        etNombre.setText(producto.nombre)
        etPrecio.setText(producto.precio.toString())
        etStock.setText(producto.cantidad.toString())
        etDescripcion.setText(producto.descripcion ?: "")
        etImagen.setText(producto.imagen ?: "")

        val catIdx = categoriasLista.indexOfFirst { it.idCategoria == producto.idCategoria }
        if (catIdx >= 0) spinnerCategoria.setSelection(catIdx)

        // 1 = Visible → posición 0 del spinner; 0 = Oculto → posición 1
        spinnerCatalogo.setSelection(if (producto.activoCatalogo == 1) 0 else 1)

        scrollForm.visibility = View.VISIBLE
        btnNuevo.visibility   = View.GONE
        etNombre.requestFocus()
    }

    private fun eliminarProducto(producto: Producto) {
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
        etCodigo.text.clear()
        etCodigo.isEnabled = true
        etNombre.text.clear()
        etPrecio.text.clear()
        etStock.text.clear()
        etDescripcion.text.clear()
        etImagen.text.clear()
        spinnerCatalogo.setSelection(0) // Por defecto: Visible en catálogo
    }
}
