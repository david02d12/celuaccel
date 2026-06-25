package com.example.myapplication

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.widget.TextView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Categoria
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CategoriaActivity : AppCompatActivity() {

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }
    private lateinit var token: String
    private var categoriaEnEdicion: Categoria? = null

    // Lista completa en memoria para filtrar localmente
    private var listaCompleta: List<Categoria> = emptyList()

    // IDs del nuevo activity_categorias.xml
    private lateinit var recyclerView:   RecyclerView
    private lateinit var cardForm:       View
    private lateinit var etNombre:       EditText
    private lateinit var etBusqueda:     EditText        // NUEVO
    private lateinit var btnNueva:       Button
    private lateinit var btnGuardar:     Button
    private lateinit var btnCancelar:    Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_categorias)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw   = prefs.getString("token", "") ?: ""
        token     = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"

        recyclerView = findViewById(R.id.recyclerCategorias)
        cardForm     = findViewById(R.id.cardFormCategoria)
        etNombre     = findViewById(R.id.etNombreCategoria)
        etBusqueda   = findViewById(R.id.etBusquedaCategoria)
        btnNueva     = findViewById(R.id.btnNuevaCategoria)
        btnGuardar   = findViewById(R.id.btnGuardarCategoria)
        btnCancelar  = findViewById(R.id.btnCancelarCategoria)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // El card del form empieza oculto
        cardForm.visibility = View.GONE

        btnNueva.setOnClickListener {
            categoriaEnEdicion = null
            etNombre.text.clear()
            cardForm.visibility = View.VISIBLE
            btnNueva.visibility = View.GONE
            etNombre.requestFocus()
        }

        btnGuardar.setOnClickListener { guardar() }

        btnCancelar.setOnClickListener {
            cardForm.visibility = View.GONE
            btnNueva.visibility = View.VISIBLE
            etNombre.text.clear()
            categoriaEnEdicion = null
        }

        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        // Búsqueda en tiempo real
        etBusqueda.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filtrarLista(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        cargar()
    }

    private fun cargar() {
        api.getCategorias(token).enqueue(object : Callback<List<Categoria>> {
            override fun onResponse(call: Call<List<Categoria>>, response: Response<List<Categoria>>) {
                if (response.isSuccessful && response.body() != null) {
                    listaCompleta = response.body()!!
                    // Aplicar búsqueda activa al recargar
                    filtrarLista(etBusqueda.text.toString())
                } else {
                    Toast.makeText(this@CategoriaActivity, "Error al cargar categorías (${response.code()})", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Categoria>>, t: Throwable) {
                Toast.makeText(this@CategoriaActivity, "Error de red: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    /** Filtra la lista en memoria y actualiza el adapter */
    private fun filtrarLista(query: String) {
        val filtrada = if (query.isBlank()) {
            listaCompleta
        } else {
            val q = query.lowercase()
            listaCompleta.filter { cat ->
                cat.nombreCategoria.lowercase().contains(q) ||
                cat.idCategoria?.toString()?.contains(q) == true
            }
        }
        recyclerView.adapter = CategoriaAdapter(
            filtrada,
            onEditar   = { cat -> iniciarEdicion(cat) },
            onEliminar = { cat -> confirmarEliminar(cat) }
        )
    }

    private fun guardar() {
        val nombre = etNombre.text.toString().trim()
        if (nombre.isEmpty()) { etNombre.error = "Nombre requerido"; return }

        val call: Call<Void> = if (categoriaEnEdicion != null) {
            api.actualizarCategoria(token, Categoria(idCategoria = categoriaEnEdicion!!.idCategoria, nombreCategoria = nombre))
        } else {
            api.agregarCategoria(token, Categoria(nombreCategoria = nombre))
        }

        call.enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    val msg = if (categoriaEnEdicion != null) "Categoría actualizada" else "Categoría agregada"
                    Toast.makeText(this@CategoriaActivity, msg, Toast.LENGTH_SHORT).show()
                    cardForm.visibility = View.GONE
                    btnNueva.visibility = View.VISIBLE
                    etNombre.text.clear()
                    categoriaEnEdicion = null
                    cargar()
                } else {
                    Toast.makeText(this@CategoriaActivity, "Error: ${response.code()}", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@CategoriaActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun iniciarEdicion(cat: Categoria) {
        categoriaEnEdicion  = cat
        etNombre.setText(cat.nombreCategoria)
        cardForm.visibility = View.VISIBLE
        btnNueva.visibility = View.GONE
        etNombre.requestFocus()
    }

    private fun confirmarEliminar(cat: Categoria) {
        AlertDialog.Builder(this)
            .setTitle("Eliminar Categoría")
            .setMessage("¿Eliminar '${cat.nombreCategoria}'? Esta acción no se puede deshacer.")
            .setPositiveButton("Eliminar") { _, _ ->
                cat.idCategoria?.let { id ->
                    api.deleteCategoria(token, id).enqueue(object : Callback<Void> {
                        override fun onResponse(call: Call<Void>, response: Response<Void>) {
                            if (response.isSuccessful) {
                                Toast.makeText(this@CategoriaActivity, "Categoría eliminada", Toast.LENGTH_SHORT).show()
                                cargar()
                            } else {
                                Toast.makeText(this@CategoriaActivity, "Error al eliminar: ${response.code()}", Toast.LENGTH_SHORT).show()
                            }
                        }
                        override fun onFailure(call: Call<Void>, t: Throwable) {
                            Toast.makeText(this@CategoriaActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                        }
                    })
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}

// ─── Adapter inline — IDs del item_categoria.xml ─────────────────────────────
class CategoriaAdapter(
    private val items: List<Categoria>,
    private val onEditar:   (Categoria) -> Unit,
    private val onEliminar: (Categoria) -> Unit
) : RecyclerView.Adapter<CategoriaAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvNombre:  TextView = v.findViewById(R.id.tvNombreCategoria)
        val btnEditar: Button   = v.findViewById(R.id.btnEditarCategoria)
        val btnElim:   Button   = v.findViewById(R.id.btnEliminarCategoria)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_categoria, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val cat = items[position]
        holder.tvNombre.text = cat.nombreCategoria
        holder.btnEditar.setOnClickListener  { onEditar(cat) }
        holder.btnElim.setOnClickListener    { onEliminar(cat) }
    }

    override fun getItemCount(): Int = items.size
}
