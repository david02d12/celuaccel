package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Cliente
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ClienteActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var btnRegresar: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_clientes)

        // Obtener y formatear el token JWT para los endpoints protegidos
        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"

        // Mapeo de todos los EditTexts del XML
        val txtDocumento = findViewById<EditText>(R.id.txtDocumento)
        val txtCodigoDocumento = findViewById<EditText>(R.id.txtCodigo_Documento)
        val txtNombre = findViewById<EditText>(R.id.txtNombre)
        val txtFechaNacimiento = findViewById<EditText>(R.id.txtFecha_Nacimiento)
        val txtDireccion = findViewById<EditText>(R.id.txtDireccion)
        val txtCorreo = findViewById<EditText>(R.id.txtCorreo)
        val txtTelefono = findViewById<EditText>(R.id.txtTelefono)
        val txtClave = findViewById<EditText>(R.id.txtClave)

        // Mapeo de botones existentes
        val btnGuardar = findViewById<Button>(R.id.btnGuardar)
        val btnBuscar = findViewById<Button>(R.id.btnBuscar)
        val btnEditar = findViewById<Button>(R.id.btnEditar)
        val btnEliminar = findViewById<Button>(R.id.btnEliminar)
        val btnIrAListar = findViewById<Button>(R.id.btnIrAListar)
        btnRegresar = findViewById(R.id.btnRegresar)

        val api = ApiClient.retrofit.create(ApiService::class.java)

        // Variable para controlar el rol del usuario
        var codigoRolActual = 2

        // GUARDAR
        btnGuardar.setOnClickListener {
            try {
                val documento = txtDocumento.text.toString().trim()
                val codDocStr = txtCodigoDocumento.text.toString().trim()
                val nombre = txtNombre.text.toString().trim()
                val fecha = txtFechaNacimiento.text.toString().trim()
                val direccion = txtDireccion.text.toString().trim()
                val correo = txtCorreo.text.toString().trim()
                val telefono = txtTelefono.text.toString().trim()
                val clave = txtClave.text.toString()

                // Validación campo por campo para evitar sorpresas o nulos
                if (documento.isEmpty()) { txtDocumento.error = "Requerido"; return@setOnClickListener }
                if (codDocStr.isEmpty()) { txtCodigoDocumento.error = "Requerido"; return@setOnClickListener }
                if (nombre.isEmpty()) { txtNombre.error = "Requerido"; return@setOnClickListener }
                if (fecha.isEmpty()) { txtFechaNacimiento.error = "Use YYYY-MM-DD"; return@setOnClickListener }
                if (direccion.isEmpty()) { txtDireccion.error = "Requerido"; return@setOnClickListener }
                if (correo.isEmpty()) { txtCorreo.error = "Requerido"; return@setOnClickListener }
                if (telefono.isEmpty()) { txtTelefono.error = "Requerido"; return@setOnClickListener }
                if (clave.isEmpty()) { txtClave.error = "Requerido"; return@setOnClickListener }

                val codigoDocumentoEntero = codDocStr.toIntOrNull()
                if (codigoDocumentoEntero == null) {
                    txtCodigoDocumento.error = "Debe ser un número válido"
                    return@setOnClickListener
                }

                val nuevoCliente = Cliente(
                    idUsuario = documento,
                    codigoDocumento = codigoDocumentoEntero,
                    nombre = nombre,
                    fechaNacimiento = fecha,
                    direccion = direccion,
                    telefono = telefono,
                    correo = correo,
                    clave = clave,
                    codigoRol = codigoRolActual
                )

                api.createCliente(nuevoCliente).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            Toast.makeText(this@ClienteActivity, "Cliente Guardado con éxito", Toast.LENGTH_SHORT).show()
                            limpiarCampos(txtDocumento, txtCodigoDocumento, txtNombre, txtFechaNacimiento, txtDireccion, txtCorreo, txtTelefono, txtClave)
                            codigoRolActual = 2
                        } else {
                            Toast.makeText(this@ClienteActivity, "Error del servidor: Código ${response.code()}", Toast.LENGTH_LONG).show()
                            Log.e("API_ERROR", "Cuerpo de error: ${response.errorBody()?.string()}")
                        }
                    }

                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        Toast.makeText(this@ClienteActivity, "Fallo de red: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
                    }
                })

            } catch (e: Exception) {
                Toast.makeText(this, "Error local: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                Log.e("CRASH_GUARDAR", "Detalle:", e)
            }
        }

        // BUSCAR
        btnBuscar.setOnClickListener {
            val documentoBuscar = txtDocumento.text.toString().trim()

            if (documentoBuscar.isEmpty()) {
                Toast.makeText(this, "Escriba el documento para buscar", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            api.getClientes(token).enqueue(object : Callback<List<Cliente>> {
                override fun onResponse(call: Call<List<Cliente>>, response: Response<List<Cliente>>) {
                    if (response.isSuccessful && response.body() != null) {
                        val listaClientes = response.body()!!
                        val cliente = listaClientes.find { it.idUsuario == documentoBuscar }

                        if (cliente != null) {
                            txtCodigoDocumento.setText(cliente.codigoDocumento.toString())
                            txtNombre.setText(cliente.nombre)
                            txtFechaNacimiento.setText(cliente.fechaNacimiento)
                            txtDireccion.setText(cliente.direccion)
                            txtCorreo.setText(cliente.correo)
                            txtTelefono.setText(cliente.telefono)

                            codigoRolActual = cliente.codigoRol
                            txtClave.setText("") // Por seguridad la clave hash no se muestra

                            Toast.makeText(this@ClienteActivity, "Usuario cargado", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(this@ClienteActivity, "No se encontró ningún usuario con ese documento", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@ClienteActivity, "Error de permisos o sesión expirada (${response.code()})", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<List<Cliente>>, t: Throwable) {
                    Toast.makeText(this@ClienteActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                }
            })
        }

        // EDITAR
        btnEditar.setOnClickListener {
            val documento = txtDocumento.text.toString().trim()
            val codDocStr = txtCodigoDocumento.text.toString().trim()
            val nombre = txtNombre.text.toString().trim()
            val fecha = txtFechaNacimiento.text.toString().trim()
            val direccion = txtDireccion.text.toString().trim()
            val correo = txtCorreo.text.toString().trim()
            val telefono = txtTelefono.text.toString().trim()
            val clave = txtClave.text.toString()


            if (documento.isEmpty() || codDocStr.isEmpty() || nombre.isEmpty() ||
                fecha.isEmpty() || direccion.isEmpty() || correo.isEmpty() || telefono.isEmpty()) {
                Toast.makeText(this, "Complete todos los campos para actualizar", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val clienteActualizado = Cliente(
                idUsuario = documento,
                codigoDocumento = codDocStr.toIntOrNull() ?: 1,
                nombre = nombre,
                fechaNacimiento = fecha,
                direccion = direccion,
                telefono = telefono,
                correo = correo,
                clave = clave,
                codigoRol = codigoRolActual
            )

            api.updateCliente(token, clienteActualizado).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ClienteActivity, "Datos actualizados correctamente", Toast.LENGTH_SHORT).show()
                        limpiarCampos(txtDocumento, txtCodigoDocumento, txtNombre, txtFechaNacimiento, txtDireccion, txtCorreo, txtTelefono, txtClave)
                        codigoRolActual = 2
                    } else {
                        Toast.makeText(this@ClienteActivity, "Error al actualizar: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ClienteActivity, "Error de comunicación con el servidor", Toast.LENGTH_SHORT).show()
                }
            })
        }

        // ELIMINAR REGISTRO
        btnEliminar.setOnClickListener {
            val documento = txtDocumento.text.toString().trim()

            if (documento.isEmpty()) {
                Toast.makeText(this, "Escriba el número de documento para eliminar", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            api.deleteCliente(token, documento).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ClienteActivity, "Usuario eliminado del sistema", Toast.LENGTH_SHORT).show()
                        limpiarCampos(txtDocumento, txtCodigoDocumento, txtNombre, txtFechaNacimiento, txtDireccion, txtCorreo, txtTelefono, txtClave)
                        codigoRolActual = 2
                    } else {
                        Toast.makeText(this@ClienteActivity, "No se pudo eliminar: Código ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ClienteActivity, "Error de red al intentar eliminar", Toast.LENGTH_SHORT).show()
                }
            })
        }

        //LISTA
        btnIrAListar.setOnClickListener {
            val intent = Intent(this, ListaClienteActivity::class.java)
            startActivity(intent)
        }

        btnRegresar.setOnClickListener {
            finish()
        }

    }

    private fun limpiarCampos(vararg editTexts: EditText) {
        for (editText in editTexts) {
            editText.text.clear()
        }
    }
}