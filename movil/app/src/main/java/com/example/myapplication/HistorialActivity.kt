package com.example.myapplication

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.os.Bundle
import android.os.Environment
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Historial
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class HistorialActivity : AppCompatActivity() {

    private lateinit var token: String
    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }

    private lateinit var recyclerView: RecyclerView
    private lateinit var etBuscar: EditText

    private var listaCompleta = listOf<Historial>()
    private var listaFiltrada = listOf<Historial>()
    private lateinit var adapter: HistorialAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_historial)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw = prefs.getString("token", "") ?: ""
        token = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"

        recyclerView = findViewById(R.id.recyclerHistorial)
        etBuscar     = findViewById(R.id.etBuscarHistorial)
        val btnRegresar = findViewById<Button>(R.id.btnRegresar)

        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = HistorialAdapter(emptyList())
        recyclerView.adapter = adapter

        btnRegresar.setOnClickListener { finish() }

        etBuscar.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filtrar(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        cargarHistorial()
    }

    private fun cargarHistorial() {
        val call = api.getHistorial(token)
        call.enqueue(object : Callback<List<Historial>> {
            override fun onResponse(call: Call<List<Historial>>, response: Response<List<Historial>>) {
                if (response.isSuccessful && response.body() != null) {
                    listaCompleta = response.body()!!
                    filtrar(etBuscar.text.toString())
                } else {
                    Toast.makeText(this@HistorialActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<List<Historial>>, t: Throwable) {
                Toast.makeText(this@HistorialActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun filtrar(query: String) {
        val q = query.lowercase().trim()
        listaFiltrada = if (q.isEmpty()) {
            listaCompleta
        } else {
            listaCompleta.filter {
                it.idServicio.toString().contains(q) ||
                (it.descripcionEvento?.lowercase()?.contains(q) == true) ||
                (it.estado?.toString() == q)
            }
        }
        
        if (listaFiltrada.isEmpty() && listaCompleta.isNotEmpty()) {
            Toast.makeText(this, "No hay resultados para \"$query\"", Toast.LENGTH_SHORT).show()
            recyclerView.visibility = View.GONE
        } else if (listaFiltrada.isNotEmpty()) {
            recyclerView.visibility = View.VISIBLE
        }
        adapter.updateList(listaFiltrada)
    }

    private fun generarPdf() {
        if (listaCompleta.isEmpty()) {
            Toast.makeText(this, "No hay datos para exportar", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val pdfDocument = PdfDocument()
            var pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4
            var page = pdfDocument.startPage(pageInfo)
            var canvas = page.canvas

            val paint = Paint()
            paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            paint.textSize = 18f
            canvas.drawText("CeluAccel - Historial de Eventos del Sistema", 40f, 50f, paint)

            paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
            paint.textSize = 12f
            val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            canvas.drawText("Fecha: ${dateFormat.format(Date())}", 40f, 70f, paint)

            paint.textSize = 10f
            paint.isFakeBoldText = true
            var yPosition = 110f
            canvas.drawText("Cód", 40f, yPosition, paint)
            canvas.drawText("Servicio", 80f, yPosition, paint)
            canvas.drawText("Fecha", 140f, yPosition, paint)
            canvas.drawText("Estado", 240f, yPosition, paint)
            canvas.drawText("Observaciones", 320f, yPosition, paint)

            paint.isFakeBoldText = false
            yPosition += 20f

            val itemsToExport = if (listaFiltrada.isNotEmpty() || etBuscar.text.isNotEmpty()) listaFiltrada else listaCompleta

            for (item in itemsToExport) {
                if (yPosition > 800f) {
                    pdfDocument.finishPage(page)
                    pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
                    page = pdfDocument.startPage(pageInfo)
                    canvas = page.canvas
                    yPosition = 50f
                }
                
                canvas.drawText(item.idHistorial.toString(), 40f, yPosition, paint)
                canvas.drawText(item.idServicio.toString(), 80f, yPosition, paint)
                canvas.drawText(item.fechaEvento ?: "", 140f, yPosition, paint)
                canvas.drawText(item.estado ?: "", 240f, yPosition, paint)
                
                val obs = item.descripcionEvento ?: ""
                val obsTruncated = if (obs.length > 40) obs.substring(0, 40) + "..." else obs
                canvas.drawText(obsTruncated, 320f, yPosition, paint)

                yPosition += 20f
            }

            pdfDocument.finishPage(page)

            val directory = getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
            val file = File(directory, "historial_celuaccel_${System.currentTimeMillis()}.pdf")
            pdfDocument.writeTo(FileOutputStream(file))
            pdfDocument.close()

            Toast.makeText(this, "PDF guardado en Documentos", Toast.LENGTH_LONG).show()

        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error al generar PDF: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}
