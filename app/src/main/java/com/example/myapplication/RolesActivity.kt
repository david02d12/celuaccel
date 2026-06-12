package com.example.myapplication

import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Rol
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RolesActivity : AppCompatActivity() {

    private lateinit var token: String
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    private lateinit var etCodigo:      EditText
    private lateinit var etDescripcion: EditText
    private lateinit var tvMensaje:     TextView
    private lateinit var progressBar:   ProgressBar
    private lateinit var recyclerView:  RecyclerView

    /** Rol seleccionado para edición (null = modo creación) */
    private var rolEditando: Rol? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_roles)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw  = prefs.getString("token", "") ?: ""
        token    = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"

        etCodigo      = findViewById(R.id.txtCodigo_Rol)
        etDescripcion = findViewById(R.id.txtDescripcion_Rol)
        tvMensaje     = findViewById(R.id.tvMensajeRol)
        progressBar   = findViewById(R.id.progressBarRoles)
        recyclerView  = findViewById(R.id.recyclerRoles)

        recyclerView.layoutManager = LinearLayoutManager(this)

        findViewById<Button>(R.id.btnGuardar).setOnClickListener { guardarRol() }
        findViewById<Button>(R.id.btnEditar).setOnClickListener  { editarRol() }
        findViewById<Button>(R.id.btnLimpiar).setOnClickListener { limpiarFormulario() }
        findViewById<Button>(R.id.btnRegresarRoles).setOnClickListener { finish() }

        cargarRoles()
    }

    // ── Cargar lista ───────────────────────────────────────────────────────────

    private fun cargarRoles() {
        progressBar.visibility = View.VISIBLE
        api.getRoles(token).enqueue(object : Callback<List<Rol>> {
            override fun onResponse(call: Call<List<Rol>>, response: Response<List<Rol>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful && response.body() != null) {
                    val lista = response.body()!!.toMutableList()
                    val adapter = RolAdapter(
                        lista,
                        onSeleccionar = { rol -> cargarEnFormulario(rol) },
                        onEliminar    = { rol -> confirmarEliminar(rol) }
                    )
                    recyclerView.adapter = adapter
                } else {
                    mostrarMensaje("Error al cargar roles: ${response.code()}", isError = true)
                }
            }
            override fun onFailure(call: Call<List<Rol>>, t: Throwable) {
                progressBar.visibility = View.GONE
                mostrarMensaje("Error de red: ${t.message}", isError = true)
            }
        })
    }

    // ── Guardar (crear) ────────────────────────────────────────────────────────

    private fun guardarRol() {
        val codigo      = etCodigo.text.toString().trim().uppercase()
        val descripcion = etDescripcion.text.toString().trim()
        if (codigo.isEmpty() || descripcion.isEmpty()) {
            mostrarMensaje("Completa código y descripción", isError = true); return
        }
        api.agregarRol(token, Rol(codigoRol = codigo, descripcionRol = descripcion))
            .enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        mostrarMensaje("✅ Rol creado correctamente", isError = false)
                        limpiarFormulario()
                        cargarRoles()
                    } else {
                        mostrarMensaje("Error ${response.code()}", isError = true)
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    mostrarMensaje("Error de red", isError = true)
                }
            })
    }

    // ── Editar (actualizar) ────────────────────────────────────────────────────

    private fun editarRol() {
        if (rolEditando == null) {
            mostrarMensaje("Selecciona un rol de la lista para editar", isError = true); return
        }
        val descripcion = etDescripcion.text.toString().trim()
        if (descripcion.isEmpty()) {
            mostrarMensaje("La descripción no puede estar vacía", isError = true); return
        }
        val rolActualizado = Rol(
            codigoRol      = rolEditando!!.codigoRol,
            descripcionRol = descripcion
        )
        api.actualizarRol(token, rolActualizado).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    mostrarMensaje("✅ Rol actualizado", isError = false)
                    limpiarFormulario()
                    cargarRoles()
                } else {
                    mostrarMensaje("Error ${response.code()}", isError = true)
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                mostrarMensaje("Error de red", isError = true)
            }
        })
    }

    // ── Eliminar ───────────────────────────────────────────────────────────────

    private fun confirmarEliminar(rol: Rol) {
        AlertDialog.Builder(this)
            .setTitle("Eliminar Rol")
            .setMessage("¿Seguro que deseas eliminar el rol '${rol.descripcionRol}'?")
            .setPositiveButton("Eliminar") { _, _ ->
                api.deleteRol(token, rol.codigoRol).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            mostrarMensaje("✅ Rol eliminado", isError = false)
                            cargarRoles()
                        } else {
                            mostrarMensaje("No se puede eliminar (${response.code()})", isError = true)
                        }
                    }
                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        mostrarMensaje("Error de red", isError = true)
                    }
                })
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private fun cargarEnFormulario(rol: Rol) {
        rolEditando = rol
        etCodigo.setText(rol.codigoRol)
        etCodigo.isEnabled = false   // El código es la PK, no se cambia
        etDescripcion.setText(rol.descripcionRol)
        mostrarMensaje("Editando: ${rol.descripcionRol}", isError = false)
    }

    private fun limpiarFormulario() {
        rolEditando       = null
        etCodigo.text.clear()
        etCodigo.isEnabled = true
        etDescripcion.text.clear()
        tvMensaje.visibility = View.GONE
    }

    private fun mostrarMensaje(msg: String, isError: Boolean) {
        tvMensaje.text       = msg
        tvMensaje.setTextColor(if (isError) Color.parseColor("#D32F2F") else Color.parseColor("#2E7D32"))
        tvMensaje.visibility = View.VISIBLE
    }
}
