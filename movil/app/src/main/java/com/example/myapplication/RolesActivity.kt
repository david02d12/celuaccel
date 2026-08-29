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
import com.example.myapplication.model.Rol
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RolesActivity : AppCompatActivity() {

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }
    private lateinit var token: String
    private var rolEnEdicion: Rol? = null

    private lateinit var recyclerView: RecyclerView
    private lateinit var cardForm:     View
    private lateinit var etCodigo:     EditText
    private lateinit var etNombre:     EditText
    private lateinit var btnNuevo:     Button
    private lateinit var btnGuardar:   Button
    private lateinit var btnCancelar:  Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_roles)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw   = prefs.getString("token", "") ?: ""
        token     = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"

        recyclerView = findViewById(R.id.recyclerRoles)
        cardForm     = findViewById(R.id.cardFormRol)
        etCodigo     = findViewById(R.id.etCodigoRol)
        etNombre     = findViewById(R.id.etNombreRol)
        btnNuevo     = findViewById(R.id.btnNuevoRol)
        btnGuardar   = findViewById(R.id.btnGuardarRol)
        btnCancelar  = findViewById(R.id.btnCancelarRol)

        recyclerView.layoutManager = LinearLayoutManager(this)
        cardForm.visibility = View.GONE

        btnNuevo.setOnClickListener {
            rolEnEdicion = null
            etCodigo.text.clear()
            etCodigo.isEnabled = true
            etCodigo.visibility = android.view.View.VISIBLE
            etNombre.text.clear()
            cardForm.visibility = View.VISIBLE
            btnNuevo.visibility = View.GONE
            etCodigo.requestFocus()
        }

        btnGuardar.setOnClickListener { guardar() }

        btnCancelar.setOnClickListener {
            cardForm.visibility = View.GONE
            btnNuevo.visibility = View.VISIBLE
            etCodigo.text.clear()
            etNombre.text.clear()
            rolEnEdicion = null
        }

        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        cargar()
    }

    private fun cargar() {
        api.getRoles(token).enqueue(object : Callback<List<Rol>> {
            override fun onResponse(call: Call<List<Rol>>, response: Response<List<Rol>>) {
                if (response.isSuccessful && response.body() != null) {
                    val lista = response.body()!!
                    recyclerView.adapter = RolAdapter(lista.toMutableList(),
                        onSeleccionar = { rol -> iniciarEdicion(rol) },
                        onEliminar    = { rol -> confirmarEliminar(rol) }
                    )
                } else {
                    Toast.makeText(this@RolesActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Rol>>, t: Throwable) {
                Toast.makeText(this@RolesActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun guardar() {
        val descripcion = etNombre.text.toString().trim()
        if (descripcion.isEmpty()) { etNombre.error = "Nombre requerido"; return }

        val call: Call<Void> = if (rolEnEdicion != null) {

            api.actualizarRol(token, Rol(codigoRol = rolEnEdicion!!.codigoRol, descripcionRol = descripcion))
        } else {

            val codigo = etCodigo.text.toString().trim()
            if (codigo.isEmpty()) { etCodigo.error = "Código requerido"; return }
            api.agregarRol(token, Rol(codigoRol = codigo, descripcionRol = descripcion))
        }

        call.enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    val msg = if (rolEnEdicion != null) "Rol actualizado" else "Rol agregado"
                    Toast.makeText(this@RolesActivity, msg, Toast.LENGTH_SHORT).show()
                    cardForm.visibility = View.GONE
                    btnNuevo.visibility = View.VISIBLE
                    etCodigo.text.clear()
                    etNombre.text.clear()
                    rolEnEdicion = null
                    cargar()
                } else {
                    val errBody = response.errorBody()?.string() ?: ""
                    Toast.makeText(this@RolesActivity, "Error ${response.code()}: $errBody", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@RolesActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun iniciarEdicion(rol: Rol) {
        rolEnEdicion = rol

        etCodigo.setText(rol.codigoRol)
        etCodigo.isEnabled = false
        etCodigo.visibility = android.view.View.GONE
        etNombre.setText(rol.descripcionRol)
        cardForm.visibility = View.VISIBLE
        btnNuevo.visibility = View.GONE
        etNombre.requestFocus()
    }

    private fun confirmarEliminar(rol: Rol) {
        AlertDialog.Builder(this)
            .setTitle("Eliminar Rol")
            .setMessage("¿Eliminar '${rol.descripcionRol}'?")
            .setPositiveButton("Eliminar") { _, _ ->
                api.deleteRol(token, rol.codigoRol).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            Toast.makeText(this@RolesActivity, "Rol eliminado", Toast.LENGTH_SHORT).show()
                            cargar()
                        } else {
                            Toast.makeText(this@RolesActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        Toast.makeText(this@RolesActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                    }
                })
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}
