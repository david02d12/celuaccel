package com.example.myapplication

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Cliente
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ClienteActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var recyclerView: RecyclerView
    private lateinit var etBuscar: EditText
    private lateinit var btnRegresar: Button
    private lateinit var api: ApiService

    private var listaCompleta = listOf<Cliente>()
    private lateinit var adapter: ClienteAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_clientes)

        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        api = ApiClient.retrofit.create(ApiService::class.java)

        recyclerView = findViewById(R.id.recyclerClientes)
        etBuscar     = findViewById(R.id.etBuscarCliente)
        btnRegresar  = findViewById(R.id.btnRegresar)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // Pasamos el callback de click para abrir el diálogo de edición
        adapter = ClienteAdapter(mutableListOf()) { cliente -> mostrarDialogoEdicion(cliente) }
        recyclerView.adapter = adapter

        btnRegresar.setOnClickListener { finish() }

        etBuscar.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { filtrar(s.toString()) }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        cargarClientes()
    }

    private fun cargarClientes() {
        api.getClientes(token).enqueue(object : Callback<List<Cliente>> {
            override fun onResponse(call: Call<List<Cliente>>, response: Response<List<Cliente>>) {
                if (response.isSuccessful && response.body() != null) {
                    listaCompleta = response.body()!!
                    filtrar(etBuscar.text.toString())
                } else {
                    Log.d("API_ERROR", "Error: ${response.code()} | ${response.errorBody()?.string()}")
                    Toast.makeText(this@ClienteActivity, "Error al cargar usuarios (${response.code()})", Toast.LENGTH_LONG).show()
                }
            }
            override fun onFailure(call: Call<List<Cliente>>, t: Throwable) {
                Log.e("RETROFIT_ERROR", "Fallo: ${t.message}")
                Toast.makeText(this@ClienteActivity, "Fallo de conexión de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun filtrar(query: String) {
        val q = query.lowercase().trim()
        val filtrados = if (q.isEmpty()) {
            listaCompleta
        } else {
            listaCompleta.filter {
                it.nombre.lowercase().contains(q) || it.idUsuario.lowercase().contains(q)
            }
        }
        adapter = ClienteAdapter(filtrados.toMutableList()) { cliente -> mostrarDialogoEdicion(cliente) }
        recyclerView.adapter = adapter
    }

    /**
     * Muestra un AlertDialog con los datos del cliente para editar.
     * También ofrece botón de eliminar.
     */
    private fun mostrarDialogoEdicion(cliente: Cliente) {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_editar_cliente, null)

        val etNombre    = dialogView.findViewById<EditText>(R.id.etDialogNombre)
        val etDireccion = dialogView.findViewById<EditText>(R.id.etDialogDireccion)
        val etTelefono  = dialogView.findViewById<EditText>(R.id.etDialogTelefono)
        val etCorreo    = dialogView.findViewById<EditText>(R.id.etDialogCorreo)
        val spinnerRol  = dialogView.findViewById<Spinner>(R.id.spinnerDialogRol)

        // Pre-llenar campos con los datos actuales
        etNombre.setText(cliente.nombre)
        etDireccion.setText(cliente.direccion)
        etTelefono.setText(cliente.telefono)
        etCorreo.setText(cliente.correo)

        val roles = arrayOf("Cliente (2)", "Técnico (1)", "Admin (3)")
        val rolesValues = intArrayOf(2, 1, 3)
        spinnerRol.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, roles)
        // Seleccionar el rol actual
        val rolIndex = rolesValues.indexOfFirst { it == cliente.codigoRol }.takeIf { it >= 0 } ?: 0
        spinnerRol.setSelection(rolIndex)

        val dialog = AlertDialog.Builder(this)
            .setTitle("Editar usuario: ${cliente.idUsuario}")
            .setView(dialogView)
            .setPositiveButton("Guardar", null) // Lo configuramos manualmente para control
            .setNeutralButton("Eliminar") { _, _ -> confirmarEliminar(cliente) }
            .setNegativeButton("Cancelar", null)
            .create()

        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val nombreNuevo    = etNombre.text.toString().trim()
                val direccionNueva = etDireccion.text.toString().trim()
                val telefonoNuevo  = etTelefono.text.toString().trim()
                val correoNuevo    = etCorreo.text.toString().trim()
                val rolNuevo       = rolesValues[spinnerRol.selectedItemPosition]

                if (nombreNuevo.isEmpty()) { etNombre.error = "Nombre requerido"; return@setOnClickListener }
                if (correoNuevo.isEmpty()) { etCorreo.error = "Correo requerido"; return@setOnClickListener }

                val clienteActualizado = Cliente(
                    idUsuario       = cliente.idUsuario,
                    codigoDocumento = cliente.codigoDocumento,
                    nombre          = nombreNuevo,
                    fechaNacimiento = cliente.fechaNacimiento,
                    direccion       = direccionNueva,
                    telefono        = telefonoNuevo,
                    correo          = correoNuevo,
                    clave           = "",   // No se modifica la contraseña desde aquí
                    codigoRol       = rolNuevo
                )

                api.updateClientePorId(token, cliente.idUsuario, clienteActualizado)
                    .enqueue(object : Callback<Void> {
                        override fun onResponse(call: Call<Void>, response: Response<Void>) {
                            if (response.isSuccessful) {
                                Toast.makeText(this@ClienteActivity, "Usuario actualizado ✓", Toast.LENGTH_SHORT).show()
                                dialog.dismiss()
                                cargarClientes()
                            } else {
                                val err = response.errorBody()?.string() ?: ""
                                Toast.makeText(this@ClienteActivity, "Error ${response.code()}: $err", Toast.LENGTH_LONG).show()
                            }
                        }
                        override fun onFailure(call: Call<Void>, t: Throwable) {
                            Toast.makeText(this@ClienteActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                        }
                    })
            }
        }

        dialog.show()
    }

    private fun confirmarEliminar(cliente: Cliente) {
        AlertDialog.Builder(this)
            .setTitle("Eliminar usuario")
            .setMessage("¿Estás seguro de eliminar a '${cliente.nombre}'?\nEsta acción no se puede deshacer.")
            .setPositiveButton("Eliminar") { _, _ ->
                api.deleteCliente(token, cliente.idUsuario).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            Toast.makeText(this@ClienteActivity, "Usuario eliminado", Toast.LENGTH_SHORT).show()
                            cargarClientes()
                        } else {
                            Toast.makeText(this@ClienteActivity, "Error ${response.code()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        Toast.makeText(this@ClienteActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                    }
                })
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}