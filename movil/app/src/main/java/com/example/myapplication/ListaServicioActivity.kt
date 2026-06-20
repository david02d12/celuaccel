package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Servicio
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ListaServicioActivity : AppCompatActivity() {

    private lateinit var recyclerView:  RecyclerView
    private lateinit var tvTotal:       android.widget.TextView

    private var listaCargada = listOf<Servicio>()

    private lateinit var token:  String
    private lateinit var userId: String
    private var userRole: Int = 2

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lista_servicios)

        val prefs    = getSharedPreferences("app", MODE_PRIVATE)
        val raw      = prefs.getString("token", "") ?: ""
        token        = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userId       = prefs.getString("user_id", "") ?: ""
        userRole     = prefs.getInt("user_role", 2)

        // IDs del nuevo activity_lista_servicios.xml
        recyclerView = findViewById(R.id.recyclerServicios)
        tvTotal      = findViewById(R.id.tvTotalServicios)

        recyclerView.layoutManager = LinearLayoutManager(this)

        // Texto total según rol
        tvTotal.text = if (userRole == 2) "Mis Solicitudes" else "Historial de Servicios"

        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }

        // Botón flotante para crear nuevo servicio o solicitud
        val fabAdd = findViewById<com.google.android.material.floatingactionbutton.FloatingActionButton>(R.id.fabAddServicio)
        fabAdd.setOnClickListener {
            val intent = if (userRole == 2) {
                android.content.Intent(this, SolicitarServicioActivity::class.java)
            } else {
                android.content.Intent(this, ServicioActivity::class.java)
            }
            startActivity(intent)
        }

        cargarServicios()
    }

    override fun onResume() {
        super.onResume()
        cargarServicios()
    }

    private fun cargarServicios() {
        val call: Call<List<Servicio>> = if (userRole == 2) {
            api.getMisServicios(token)
        } else {
            api.getServicios(token)
        }

        call.enqueue(object : Callback<List<Servicio>> {
            override fun onResponse(call: Call<List<Servicio>>, response: Response<List<Servicio>>) {
                if (response.isSuccessful && response.body() != null) {
                    listaCargada = response.body()!!
                    tvTotal.text = if (userRole == 2)
                        "${listaCargada.size} solicitudes"
                    else
                        "${listaCargada.size} servicios en total"

                    recyclerView.adapter = ServicioAdapter(
                        servicios  = listaCargada,
                        esCliente  = userRole == 2,
                        onCancelar = { servicio -> confirmarCancelar(servicio) },
                        onChat     = { servicio -> abrirChat(servicio) }
                    )
                } else {
                    Toast.makeText(
                        this@ListaServicioActivity,
                        "Error al obtener servicios (${response.code()})",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
            override fun onFailure(call: Call<List<Servicio>>, t: Throwable) {
                Toast.makeText(this@ListaServicioActivity, "Error de conexión: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun confirmarCancelar(servicio: Servicio) {
        AlertDialog.Builder(this)
            .setTitle("Cancelar Servicio")
            .setMessage("¿Estás seguro de cancelar el Servicio #${servicio.idServicio}?\nEsta acción no se puede deshacer.")
            .setPositiveButton("Cancelar Servicio") { _, _ ->
                servicio.idServicio?.let { id ->
                    api.cancelarServicio(token, id).enqueue(object : Callback<Void> {
                        override fun onResponse(call: Call<Void>, response: Response<Void>) {
                            if (response.isSuccessful) {
                                Toast.makeText(this@ListaServicioActivity, "Servicio cancelado correctamente.", Toast.LENGTH_SHORT).show()
                                cargarServicios()
                            } else {
                                val msg = when (response.code()) {
                                    403  -> "No puedes cancelar este servicio."
                                    404  -> "Servicio no encontrado."
                                    else -> "Error al cancelar (${response.code()})."
                                }
                                Toast.makeText(this@ListaServicioActivity, msg, Toast.LENGTH_LONG).show()
                            }
                        }
                        override fun onFailure(call: Call<Void>, t: Throwable) {
                            Toast.makeText(this@ListaServicioActivity, "Error de conexión.", Toast.LENGTH_SHORT).show()
                        }
                    })
                }
            }
            .setNegativeButton("Mantener", null)
            .show()
    }

    private fun abrirChat(servicio: Servicio) {
        servicio.idServicio?.let { id ->
            val intent = Intent(this, ChatListActivity::class.java)
            intent.putExtra("ID_SERVICIO", id)
            startActivity(intent)
        } ?: Toast.makeText(this, "Servicio sin ID, no se puede abrir el chat.", Toast.LENGTH_SHORT).show()
    }

    private fun generarPdf() {
        if (listaCargada.isEmpty()) {
            Toast.makeText(this, "No hay datos para exportar", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val pdfDocument = android.graphics.pdf.PdfDocument()
            var pageInfo = android.graphics.pdf.PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4
            var page = pdfDocument.startPage(pageInfo)
            var canvas = page.canvas

            val paint = android.graphics.Paint()
            paint.typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
            paint.textSize = 18f
            canvas.drawText(if (userRole == 2) "Mis Servicios - CeluAccel" else "Servicios Globales - CeluAccel", 40f, 50f, paint)

            paint.typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.NORMAL)
            paint.textSize = 12f
            val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm", java.util.Locale.getDefault())
            canvas.drawText("Fecha: ${dateFormat.format(java.util.Date())}", 40f, 70f, paint)

            paint.textSize = 10f
            paint.isFakeBoldText = true
            var yPosition = 110f
            canvas.drawText("ID", 40f, yPosition, paint)
            canvas.drawText("Móvil", 80f, yPosition, paint)
            canvas.drawText("Fallo", 180f, yPosition, paint)
            canvas.drawText("Fecha", 320f, yPosition, paint)
            canvas.drawText("Estado", 400f, yPosition, paint)
            canvas.drawText("Costo", 480f, yPosition, paint)

            paint.isFakeBoldText = false
            yPosition += 20f

            for (item in listaCargada) {
                if (yPosition > 800f) {
                    pdfDocument.finishPage(page)
                    pageInfo = android.graphics.pdf.PdfDocument.PageInfo.Builder(595, 842, 1).create()
                    page = pdfDocument.startPage(pageInfo)
                    canvas = page.canvas
                    yPosition = 50f
                }
                
                canvas.drawText(item.idServicio.toString(), 40f, yPosition, paint)
                
                val movil = item.movilNombre ?: ""
                val movilTrunc = if (movil.length > 15) movil.substring(0, 15) + "..." else movil
                canvas.drawText(movilTrunc, 80f, yPosition, paint)
                
                val fallo = item.descripcion ?: ""
                val falloTrunc = if (fallo.length > 25) fallo.substring(0, 25) + "..." else fallo
                canvas.drawText(falloTrunc, 180f, yPosition, paint)
                
                canvas.drawText(item.fecha ?: "", 320f, yPosition, paint)
                
                val estadoTxt = when (item.etapa) {
                    0 -> "Recibido"
                    1 -> "Diagnóstico"
                    2 -> "Reparación"
                    3 -> "Control"
                    4 -> "Finalizado"
                    5 -> "Entregado"
                    -1 -> "Cancelado"
                    else -> "Etapa ${item.etapa}"
                }
                canvas.drawText(estadoTxt, 400f, yPosition, paint)
                
                canvas.drawText("$${item.precio ?: 0.0}", 480f, yPosition, paint)

                yPosition += 20f
            }

            pdfDocument.finishPage(page)

            val directory = getExternalFilesDir(android.os.Environment.DIRECTORY_DOCUMENTS)
            val file = java.io.File(directory, "servicios_celuaccel_${System.currentTimeMillis()}.pdf")
            pdfDocument.writeTo(java.io.FileOutputStream(file))
            pdfDocument.close()

            Toast.makeText(this, "PDF guardado en Documentos", Toast.LENGTH_LONG).show()

        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error al generar PDF: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}