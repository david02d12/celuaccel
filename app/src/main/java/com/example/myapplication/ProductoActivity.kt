package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.Switch
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_productos)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        val txtCodigoProducto = findViewById<EditText>(R.id.txtCodigoProducto)
        val txtNombre = findViewById<EditText>(R.id.txtNombreProducto)
        val txtDescripcion = findViewById<EditText>(R.id.txtDescripcion)
        val txtPrecio = findViewById<EditText>(R.id.txtPrecio)
        val txtCantidad = findViewById<EditText>(R.id.txtCantidad)
        val txtImagen = findViewById<EditText>(R.id.txtImagen)
        val spinnerCategoria = findViewById<Spinner>(R.id.spinnerCategoria)
        val switchActivoCatalogo = findViewById<Switch>(R.id.switchActivoCatalogo)

        val btnGuardar = findViewById<Button>(R.id.btnGuardarProducto)
        val btnBuscar = findViewById<Button>(R.id.btnBuscar)
        val btnEditar = findViewById<Button>(R.id.btnEditar)
        val btnEliminar = findViewById<Button>(R.id.btnEliminar)
        val btnIrAListar = findViewById<Button>(R.id.btnIrAListar)
        val btnRegresar = findViewById<Button>(R.id.btnRegresar)

        val api = ApiClient.retrofit.create(ApiService::class.java)

        // Cargar categorías
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

        btnGuardar.setOnClickListener {
            val codigo = txtCodigoProducto.text.toString().trim()
            val nombre = txtNombre.text.toString().trim()
            val desc = txtDescripcion.text.toString().trim()
            val precio = txtPrecio.text.toString().toDoubleOrNull() ?: 0.0
            val cantidad = txtCantidad.text.toString().toIntOrNull() ?: 0
            val imagen = txtImagen.text.toString().trim()
            val activo = if (switchActivoCatalogo.isChecked) 1 else 0
            
            val catIndex = spinnerCategoria.selectedItemPosition
            val idCategoria = if (catIndex >= 0 && categoriasLista.isNotEmpty()) categoriasLista[catIndex].idCategoria else null

            if (codigo.isEmpty() || nombre.isEmpty()) {
                Toast.makeText(this, "Código y Nombre son obligatorios", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val nuevoProducto = Producto(
                codigoProducto = codigo,
                cantidad = cantidad,
                precio = precio,
                nombre = nombre,
                descripcion = desc,
                imagen = imagen,
                activoCatalogo = activo,
                idCategoria = idCategoria
            )

            api.agregarProducto(token, nuevoProducto).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ProductoActivity, "Producto guardado", Toast.LENGTH_SHORT).show()
                        limpiarCampos(txtCodigoProducto, txtNombre, txtDescripcion, txtPrecio, txtCantidad, txtImagen)
                    } else {
                        Toast.makeText(this@ProductoActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ProductoActivity, "Error de red", Toast.LENGTH_SHORT).show()
                }
            })
        }

        btnBuscar.setOnClickListener {
            val codigoBuscar = txtCodigoProducto.text.toString().trim()
            if (codigoBuscar.isEmpty()) {
                Toast.makeText(this, "Escriba el código para buscar", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            api.getProductos(token).enqueue(object : Callback<List<Producto>> {
                override fun onResponse(call: Call<List<Producto>>, response: Response<List<Producto>>) {
                    if (response.isSuccessful && response.body() != null) {
                        val producto = response.body()!!.find { it.codigoProducto == codigoBuscar }
                        if (producto != null) {
                            txtNombre.setText(producto.nombre)
                            txtDescripcion.setText(producto.descripcion ?: "")
                            txtPrecio.setText(producto.precio.toString())
                            txtCantidad.setText(producto.cantidad.toString())
                            txtImagen.setText(producto.imagen ?: "")
                            switchActivoCatalogo.isChecked = producto.activoCatalogo == 1
                            
                            val catIndex = categoriasLista.indexOfFirst { it.idCategoria == producto.idCategoria }
                            if (catIndex >= 0) {
                                spinnerCategoria.setSelection(catIndex)
                            }
                            Toast.makeText(this@ProductoActivity, "Producto encontrado", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(this@ProductoActivity, "Producto no encontrado", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
                override fun onFailure(call: Call<List<Producto>>, t: Throwable) {
                    Toast.makeText(this@ProductoActivity, "Error de red", Toast.LENGTH_SHORT).show()
                }
            })
        }

        btnEditar.setOnClickListener {
            val codigo = txtCodigoProducto.text.toString().trim()
            val nombre = txtNombre.text.toString().trim()
            val desc = txtDescripcion.text.toString().trim()
            val precio = txtPrecio.text.toString().toDoubleOrNull() ?: 0.0
            val cantidad = txtCantidad.text.toString().toIntOrNull() ?: 0
            val imagen = txtImagen.text.toString().trim()
            val activo = if (switchActivoCatalogo.isChecked) 1 else 0
            
            val catIndex = spinnerCategoria.selectedItemPosition
            val idCategoria = if (catIndex >= 0 && categoriasLista.isNotEmpty()) categoriasLista[catIndex].idCategoria else null

            if (codigo.isEmpty() || nombre.isEmpty()) {
                Toast.makeText(this, "Código y Nombre son obligatorios", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val prodActualizado = Producto(
                codigoProducto = codigo,
                cantidad = cantidad,
                precio = precio,
                nombre = nombre,
                descripcion = desc,
                imagen = imagen,
                activoCatalogo = activo,
                idCategoria = idCategoria
            )

            api.actualizarProducto(token, prodActualizado).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ProductoActivity, "Producto actualizado", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@ProductoActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ProductoActivity, "Error de red", Toast.LENGTH_SHORT).show()
                }
            })
        }

        btnEliminar.setOnClickListener {
            val codigo = txtCodigoProducto.text.toString().trim()
            if (codigo.isEmpty()) {
                Toast.makeText(this, "Escriba el código para eliminar", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            api.deleteProducto(token, codigo).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ProductoActivity, "Producto eliminado", Toast.LENGTH_SHORT).show()
                        limpiarCampos(txtCodigoProducto, txtNombre, txtDescripcion, txtPrecio, txtCantidad, txtImagen)
                    } else {
                        Toast.makeText(this@ProductoActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ProductoActivity, "Error de red", Toast.LENGTH_SHORT).show()
                }
            })
        }

        btnIrAListar.setOnClickListener {
            startActivity(Intent(this, ListaProductoActivity::class.java))
        }

        btnRegresar.setOnClickListener {
            finish()
        }
    }

    private fun limpiarCampos(vararg editTexts: EditText) {
        for (field in editTexts) {
            field.text.clear()
        }
    }
}
