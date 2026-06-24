package com.example.myapplication

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Cliente
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class FormularioClienteActivity : AppCompatActivity() {

    private lateinit var token: String
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    private lateinit var etIdCliente: EditText
    private lateinit var etNombre: EditText
    private lateinit var etFechaNac: EditText
    private lateinit var etDireccion: EditText
    private lateinit var etTelefono: EditText
    private lateinit var etCorreo: EditText
    private lateinit var etClave: EditText
    private lateinit var spinnerDoc: Spinner
    private lateinit var spinnerRol: Spinner

    private val listaRolesValores = listOf(2, 1, 3) // 2=Cliente, 1=Técnico, 3=Admin
    private val listaDocValores = listOf(1, 2, 3)   // 1=CC, 2=CE, 3=NIT

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_formulario_cliente)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"

        // Vincular componentes
        etIdCliente = findViewById(R.id.txtIdClienteForm)
        etNombre = findViewById(R.id.txtNombreClienteForm)
        etFechaNac = findViewById(R.id.txtFechaNacClienteForm)
        etDireccion = findViewById(R.id.txtDireccionClienteForm)
        etTelefono = findViewById(R.id.txtTelefonoClienteForm)
        etCorreo = findViewById(R.id.txtCorreoClienteForm)
        etClave = findViewById(R.id.txtClaveClienteForm)
        spinnerDoc = findViewById(R.id.spinnerTipoDocClienteForm)
        spinnerRol = findViewById(R.id.spinnerRolClienteForm)

        val adapterDoc = ArrayAdapter(this, android.R.layout.simple_spinner_item, listOf("Cédula de Ciudadanía (CC)", "Cédula de Extranjería (CE)", "NIT"))
        spinnerDoc.adapter = adapterDoc

        val adapterRol = ArrayAdapter(this, android.R.layout.simple_spinner_item, listOf("Cliente", "Técnico", "Administrador"))
        spinnerRol.adapter = adapterRol

        val btnGuardar = findViewById<Button>(R.id.btnRegistrarClienteForm)
        val btnActualizar = findViewById<Button>(R.id.btnActualizarClienteForm)
        val btnEliminar = findViewById<Button>(R.id.btnEliminarClienteForm)
        findViewById<Button>(R.id.btnRegresarClienteForm).setOnClickListener { finish() }

        // Cargar datos si viene direccionado desde el RecyclerView
        val idRecibido = intent.getStringExtra("ID_CLIENTE_SELECCIONADO")
        if (!idRecibido.isNullOrEmpty()) {
            etIdCliente.setText(idRecibido)
            etIdCliente.isEnabled = false
            cargarDatosCliente(idRecibido)
        }

        // AGREGAR CLIENTE
        btnGuardar.setOnClickListener {
            val cliente = capturarObjetoCliente() ?: return@setOnClickListener
            api.createCliente(cliente).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@FormularioClienteActivity, "Cliente registrado con éxito.", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@FormularioClienteActivity, "Error al guardar: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@FormularioClienteActivity, "Error de red", Toast.LENGTH_SHORT).show()
                }
            })
        }

        // ACTUALIZAR CLIENTE
        btnActualizar.setOnClickListener {
            val id = etIdCliente.text.toString().trim()
            val cliente = capturarObjetoCliente() ?: return@setOnClickListener
            if (id.isEmpty()) return@setOnClickListener

            api.updateClientePorId(token, id, cliente).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@FormularioClienteActivity, "Información actualizada.", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@FormularioClienteActivity, "Error al actualizar (${response.code()})", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@FormularioClienteActivity, "Fallo de conexión.", Toast.LENGTH_SHORT).show()
                }
            })
        }

        // ELIMINAR CLIENTE
        btnEliminar.setOnClickListener {
            val id = etIdCliente.text.toString().trim()
            if (id.isEmpty()) return@setOnClickListener

            api.deleteCliente(token, id).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@FormularioClienteActivity, "Cliente dado de baja del sistema.", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@FormularioClienteActivity, "No se puede eliminar por dependencias activas.", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@FormularioClienteActivity, "Error en los canales de comunicación.", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }

    private fun cargarDatosCliente(id: String) {
        api.getPerfil(token, id).enqueue(object : Callback<Cliente> {
            override fun onResponse(call: Call<Cliente>, response: Response<Cliente>) {
                if (response.isSuccessful && response.body() != null) {
                    val c = response.body()!!
                    etNombre.setText(c.nombre)
                    etFechaNac.setText(c.fechaNacimiento)
                    etDireccion.setText(c.direccion)
                    etTelefono.setText(c.telefono)
                    etCorreo.setText(c.correo)
                    etClave.setText(c.clave)

                    val idxDoc = listaDocValores.indexOf(c.codigoDocumento)
                    if (idxDoc >= 0) spinnerDoc.setSelection(idxDoc)

                    val idxRol = listaRolesValores.indexOf(c.codigoRol)
                    if (idxRol >= 0) spinnerRol.setSelection(idxRol)
                }
            }
            override fun onFailure(call: Call<Cliente>, t: Throwable) {}
        })
    }

    private fun capturarObjetoCliente(): Cliente? {
        val id = etIdCliente.text.toString().trim()
        val nombre = etNombre.text.toString().trim()
        val correo = etCorreo.text.toString().trim()

        if (id.isEmpty() || nombre.isEmpty() || correo.isEmpty()) {
            Toast.makeText(this, "Documento, Nombre y Correo son obligatorios.", Toast.LENGTH_SHORT).show()
            return null
        }

        return Cliente(
            idUsuario = id,
            codigoDocumento = listaDocValores[spinnerDoc.selectedItemPosition],
            nombre = nombre,
            fechaNacimiento = etFechaNac.text.toString().trim().ifEmpty { "2026-01-01" },
            direccion = etDireccion.text.toString().trim(),
            telefono = etTelefono.text.toString().trim(),
            correo = correo,
            clave = etClave.text.toString().trim().ifEmpty { "123456" },
            codigoRol = listaRolesValores[spinnerRol.selectedItemPosition]
        )
    }
}