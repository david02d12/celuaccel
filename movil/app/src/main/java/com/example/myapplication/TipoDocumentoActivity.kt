
package com.example.myapplication

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.TipoDocumento
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class TipoDocumentoActivity : AppCompatActivity() {

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }
    private lateinit var token: String
    private var tipoEnEdicion: TipoDocumento? = null

    // IDs del activity_tipo_documento.xml
    private lateinit var recyclerView:  RecyclerView
    private lateinit var cardForm:      View        // LinearLayout cardFormTipoDoc
    private lateinit var etNombre:      EditText    // etNombreTipoDoc  → Nombre del tipo
    private lateinit var etAbreviatura: EditText    // etAbreviaturaTipoDoc → Código/abreviatura
    private lateinit var btnNuevo:      Button
    private lateinit var btnGuardar:    Button
    private lateinit var btnCancelar:   Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_tipo_documento)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw   = prefs.getString("token", "") ?: ""
        token     = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"

        recyclerView  = findViewById(R.id.recyclerTipoDocumento)
        cardForm      = findViewById(R.id.cardFormTipoDoc)
        etNombre      = findViewById(R.id.etNombreTipoDoc)
        etAbreviatura = findViewById(R.id.etAbreviaturaTipoDoc)
        btnNuevo      = findViewById(R.id.btnNuevoTipoDoc)
        btnGuardar    = findViewById(R.id.btnGuardarTipoDoc)
        btnCancelar   = findViewById(R.id.btnCancelarTipoDoc)

        recyclerView.layoutManager = LinearLayoutManager(this)
        cardForm.visibility = View.GONE

        btnNuevo.setOnClickListener {
            tipoEnEdicion = null
            etNombre.text.clear()
            etAbreviatura.text.clear()
            etAbreviatura.isEnabled = true
            cardForm.visibility = View.VISIBLE
            btnNuevo.visibility = View.GONE
            etNombre.requestFocus()
        }

        btnGuardar.setOnClickListener { guardar() }

        btnCancelar.setOnClickListener { cancelarEdicion() }

        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        cargar()
    }

    private fun cargar() {
        api.getTiposDocumento(token).enqueue(object : Callback<List<TipoDocumento>> {
            override fun onResponse(call: Call<List<TipoDocumento>>, response: Response<List<TipoDocumento>>) {
                if (response.isSuccessful && response.body() != null) {
                    val lista = response.body()!!
                    recyclerView.adapter = TipoDocumentoAdapter(lista,
                        onEditar   = { tipo -> iniciarEdicion(tipo) },
                        onEliminar = { tipo -> confirmarEliminar(tipo) }
                    )
                } else {
                    Toast.makeText(this@TipoDocumentoActivity, "Error al cargar tipos (${response.code()})", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<TipoDocumento>>, t: Throwable) {
                Toast.makeText(this@TipoDocumentoActivity, "Error de red: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun guardar() {
        val nombre       = etNombre.text.toString().trim()
        val abreviatura  = etAbreviatura.text.toString().trim()

        if (nombre.isEmpty()) { etNombre.error = "Nombre requerido"; return }

        val call: Call<Void> = if (tipoEnEdicion != null) {
            val actualizado = TipoDocumento(
                codigoDocumento = tipoEnEdicion!!.codigoDocumento,
                nombreDocumento = nombre
            )
            api.actualizarTipoDocumento(token, actualizado)
        } else {
            val codigo = abreviatura.toIntOrNull()
            if (codigo == null) { etAbreviatura.error = "Código numérico requerido"; return }
            api.agregarTipoDocumento(token, TipoDocumento(codigoDocumento = codigo, nombreDocumento = nombre))
        }

        call.enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    val msg = if (tipoEnEdicion != null) "Tipo actualizado" else "Tipo de documento agregado"
                    Toast.makeText(this@TipoDocumentoActivity, msg, Toast.LENGTH_SHORT).show()
                    cancelarEdicion()
                    cargar()
                } else {
                    val msg = if (response.code() == 409) "Ese código ya existe" else "Error: ${response.code()}"
                    Toast.makeText(this@TipoDocumentoActivity, msg, Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@TipoDocumentoActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun iniciarEdicion(tipo: TipoDocumento) {
        tipoEnEdicion          = tipo
        etNombre.setText(tipo.nombreDocumento)
        etAbreviatura.setText(tipo.codigoDocumento?.toString() ?: "")
        etAbreviatura.isEnabled = false   // No permitir cambiar el código primario
        cardForm.visibility    = View.VISIBLE
        btnNuevo.visibility    = View.GONE
        etNombre.requestFocus()
    }

    private fun cancelarEdicion() {
        tipoEnEdicion          = null
        etNombre.text.clear()
        etAbreviatura.text.clear()
        etAbreviatura.isEnabled = true
        cardForm.visibility    = View.GONE
        btnNuevo.visibility    = View.VISIBLE
    }

    private fun confirmarEliminar(tipo: TipoDocumento) {
        AlertDialog.Builder(this)
            .setTitle("Eliminar Tipo de Documento")
            .setMessage("¿Eliminar '${tipo.nombreDocumento}'?\n⚠ Esto puede afectar usuarios que lo usen.")
            .setPositiveButton("Eliminar") { _, _ ->
                tipo.codigoDocumento?.let { id ->
                    api.deleteTipoDocumento(token, id).enqueue(object : Callback<Void> {
                        override fun onResponse(call: Call<Void>, response: Response<Void>) {
                            if (response.isSuccessful) {
                                Toast.makeText(this@TipoDocumentoActivity, "Tipo eliminado", Toast.LENGTH_SHORT).show()
                                cargar()
                            } else {
                                Toast.makeText(this@TipoDocumentoActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                            }
                        }
                        override fun onFailure(call: Call<Void>, t: Throwable) {
                            Toast.makeText(this@TipoDocumentoActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                        }
                    })
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}

// ─── Adapter inline ───────────────────────────────────────────────────────────
class TipoDocumentoAdapter(
    private val items: List<TipoDocumento>,
    private val onEditar:   (TipoDocumento) -> Unit,
    private val onEliminar: (TipoDocumento) -> Unit
) : RecyclerView.Adapter<TipoDocumentoAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvNombre:  TextView = v.findViewById(R.id.tvNombreTipoDoc)
        val tvCodigo:  TextView = v.findViewById(R.id.tvAbreviaturaTipoDoc)
        val btnEditar: Button   = v.findViewById(R.id.btnEditarTipoDoc)
        val btnElim:   Button   = v.findViewById(R.id.btnEliminarTipoDoc)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_tipo_documento, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val tipo = items[position]
        holder.tvNombre.text = tipo.nombreDocumento
        holder.tvCodigo.text = "Cód: ${tipo.codigoDocumento ?: "—"}"
        holder.btnEditar.setOnClickListener  { onEditar(tipo) }
        holder.btnElim.setOnClickListener    { onEliminar(tipo) }
    }

    override fun getItemCount(): Int = items.size
}
