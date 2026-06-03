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
import com.example.myapplication.model.Servicio
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ServicioActivity : AppCompatActivity() {

    private lateinit var token: String
    private lateinit var idUsuarioAutenticado: String
    private lateinit var btnRegresar: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_servicios)


        val sharedPref = getSharedPreferences("app", MODE_PRIVATE)
        val tokenGuardado = sharedPref.getString("token", "") ?: ""
        token = if (tokenGuardado.startsWith("Bearer ")) tokenGuardado else "Bearer $tokenGuardado"
        idUsuarioAutenticado = sharedPref.getString("user_id", "") ?: ""


        val txtIdServicio = findViewById<EditText>(R.id.txtIdServicio)
        val txtDescripcion = findViewById<EditText>(R.id.txtDescripcion)
        val txtIdUsuario = findViewById<EditText>(R.id.txtIdUsuario)
        val txtPrecio = findViewById<EditText>(R.id.txtPrecio)
        val txtMovilNombre = findViewById<EditText>(R.id.txtMovilNombre)
        val txtMovilEspecificacion = findViewById<EditText>(R.id.txtMovilEspecificacion)
        val txtFecha = findViewById<EditText>(R.id.txtFecha)
        val txtEtapa = findViewById<EditText>(R.id.txtEtapa)


        txtIdUsuario.setText(idUsuarioAutenticado)


        val btnAgregar = findViewById<Button>(R.id.btnAgregarServicio)
        val btnBuscarMisServicios = findViewById<Button>(R.id.btnBuscarMisServicios)
        val btnActualizar = findViewById<Button>(R.id.btnActualizarServicio)
        val btnCancelar = findViewById<Button>(R.id.btnCancelarServicio)
        val btnEliminar = findViewById<Button>(R.id.btnEliminarServicio)

        val btnIrAListarServicios = findViewById<Button>(R.id.btnIrAListarServicios)

        btnRegresar = findViewById(R.id.btnRegresar)

        val api = ApiClient.retrofit.create(ApiService::class.java)


        // AGREGAR NUEVO SERVICIO
        btnAgregar.setOnClickListener {
            val desc = txtDescripcion.text.toString().trim()
            val idUser = txtIdUsuario.text.toString().trim()
            val precioStr = txtPrecio.text.toString().trim()
            val movilNom = txtMovilNombre.text.toString().trim()
            val movilEsp = txtMovilEspecificacion.text.toString().trim()
            val fecha = txtFecha.text.toString().trim()
            val etapaStr = txtEtapa.text.toString().trim()

            if (desc.isEmpty() || idUser.isEmpty()) {
                Toast.makeText(this, "Descripción e ID Usuario son obligatorios.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val nuevoServicio = Servicio(
                descripcion = desc,
                idUsuario = idUser,
                precio = precioStr.toDoubleOrNull() ?: 0.0,
                movilNombre = movilNom,
                movilEspecificacion = movilEsp,
                fecha = if (fecha.isEmpty()) "2026-01-01" else fecha, // Formato YYYY-MM-DD
                etapa = etapaStr.toIntOrNull() ?: 0
            )

            api.agregarServicio(token, nuevoServicio).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ServicioActivity, "Servicio agregado correctamente.", Toast.LENGTH_SHORT).show()
                        limpiarCampos(txtIdServicio, txtDescripcion, txtPrecio, txtMovilNombre, txtMovilEspecificacion, txtFecha, txtEtapa)
                        txtIdUsuario.setText(idUsuarioAutenticado)
                    } else {
                        Toast.makeText(this@ServicioActivity, "Error: ${response.code()} | IDOR u obligatorios vacíos", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ServicioActivity, "Error de red: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            })
        }


        // BUSCAR MIS SERVICIOS
        btnBuscarMisServicios.setOnClickListener {
            val userAFiltrar = txtIdUsuario.text.toString().trim()

            if (userAFiltrar.isEmpty()) {
                Toast.makeText(this, "Digite un ID de usuario para consultar", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            api.getMisServicios(token, userAFiltrar).enqueue(object : Callback<List<Servicio>> {
                override fun onResponse(call: Call<List<Servicio>>, response: Response<List<Servicio>>) {
                    if (response.isSuccessful && response.body() != null) {
                        val lista = response.body()!!
                        if (lista.isNotEmpty()) {
                            // Tomamos el primer servicio de la lista para rellenar el formulario de ejemplo
                            val primerServicio = lista[0]
                            txtIdServicio.setText(primerServicio.idServicio.toString())
                            txtDescripcion.setText(primerServicio.descripcion)
                            txtPrecio.setText(primerServicio.precio.toString())
                            txtMovilNombre.setText(primerServicio.movilNombre)
                            txtMovilEspecificacion.setText(primerServicio.movilEspecificacion)
                            txtFecha.setText(primerServicio.fecha)
                            txtEtapa.setText(primerServicio.etapa.toString())
                            Toast.makeText(this@ServicioActivity, "Se cargó el servicio más reciente.", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(this@ServicioActivity, "Este usuario no tiene servicios registrados.", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@ServicioActivity, "Acceso denegado o error del servidor (${response.code()})", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<List<Servicio>>, t: Throwable) {
                    Toast.makeText(this@ServicioActivity, "Fallo de conexión.", Toast.LENGTH_SHORT).show()
                }
            })
        }


        // ACTUALIZAR SERVICIO
        btnActualizar.setOnClickListener {
            val idServicioStr = txtIdServicio.text.toString().trim()
            val desc = txtDescripcion.text.toString().trim()
            val idUser = txtIdUsuario.text.toString().trim()
            val precioStr = txtPrecio.text.toString().trim()
            val movilNom = txtMovilNombre.text.toString().trim()
            val movilEsp = txtMovilEspecificacion.text.toString().trim()
            val fecha = txtFecha.text.toString().trim()
            val etapaStr = txtEtapa.text.toString().trim()

            if (idServicioStr.isEmpty()) {
                Toast.makeText(this, "Se requiere el ID_Servicio para actualizar.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val servicioEditado = Servicio(
                idServicio = idServicioStr.toInt(),
                descripcion = desc,
                idUsuario = idUser,
                precio = precioStr.toDoubleOrNull() ?: 0.0,
                movilNombre = movilNom,
                movilEspecificacion = movilEsp,
                fecha = fecha,
                etapa = etapaStr.toIntOrNull() ?: 0
            )

            api.actualizarServicio(token, servicioEditado).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ServicioActivity, "Servicio actualizado.", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@ServicioActivity, "Error al actualizar (${response.code()})", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ServicioActivity, "Fallo de red.", Toast.LENGTH_SHORT).show()
                }
            })
        }


        // CANCELAR SERVICIO
        btnCancelar.setOnClickListener {
            val idServicioStr = txtIdServicio.text.toString().trim()

            if (idServicioStr.isEmpty()) {
                Toast.makeText(this, "Se requiere el ID_Servicio para cancelar.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            api.cancelarServicio(token, idServicioStr.toInt()).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    when (response.code()) {
                        200 -> {
                            Toast.makeText(this@ServicioActivity, "Servicio cancelado con éxito (-1).", Toast.LENGTH_SHORT).show()
                            txtEtapa.setText("-1")
                        }
                        409 -> Toast.makeText(this@ServicioActivity, "Conflicto: Ya está completado o cancelado.", Toast.LENGTH_LONG).show()
                        403 -> Toast.makeText(this@ServicioActivity, "No tienes permisos para cancelar esto.", Toast.LENGTH_SHORT).show()
                        else -> Toast.makeText(this@ServicioActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ServicioActivity, "Error de red.", Toast.LENGTH_SHORT).show()
                }
            })
        }


        // ELIMINAR SERVICIO
        btnEliminar.setOnClickListener {
            val idServicioStr = txtIdServicio.text.toString().trim()

            if (idServicioStr.isEmpty()) {
                Toast.makeText(this, "Se requiere el ID_Servicio para eliminar.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            api.deleteServicio(token, idServicioStr.toInt()).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ServicioActivity, "Servicio eliminado de la base de datos.", Toast.LENGTH_SHORT).show()
                        limpiarCampos(txtIdServicio, txtDescripcion, txtPrecio, txtMovilNombre, txtMovilEspecificacion, txtFecha, txtEtapa)
                        txtIdUsuario.setText(idUsuarioAutenticado)
                    } else {
                        Toast.makeText(this@ServicioActivity, "Error al eliminar (${response.code()})", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ServicioActivity, "Error de red.", Toast.LENGTH_SHORT).show()
                }
            })
        }


        //LISTA
        btnIrAListarServicios.setOnClickListener {
            val intent = Intent(this, ListaServicioActivity::class.java)
            startActivity(intent)
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