package com.example.myapplication

import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
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
        val btnExportarPdf = findViewById<Button>(R.id.btnExportarPdf)

        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = HistorialAdapter(emptyList())
        recyclerView.adapter = adapter

        btnRegresar.setOnClickListener { finish() }
        btnExportarPdf.setOnClickListener { generarPdf() }

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
                    findViewById<Button>(R.id.btnExportarPdf).visibility = View.VISIBLE
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
        } else {
            recyclerView.visibility = View.VISIBLE
        }
        adapter.updateList(listaFiltrada)
    }

    private fun generarPdf() {
        val items = listaFiltrada.ifEmpty { listaCompleta }
        if (items.isEmpty()) {
            Toast.makeText(this, "No hay datos para exportar", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val pdfDocument = PdfDocument()
            val red = Color.rgb(219, 0, 0)
            val darkText = Color.rgb(26, 26, 26)
            val altRow = Color.rgb(248, 249, 250)
            val lightGray = Color.rgb(230, 230, 230)

            val colWidths = floatArrayOf(50f, 60f, 80f, 250f, 115f)
            val headers = arrayOf("ID", "Servicio", "Fecha", "Descripcion", "Estado")
            val x = 30f
            val rowsPerPage = 40


            val headerBg = Paint().apply { color = red; style = Paint.Style.FILL }
            val headerTextPaint = Paint().apply {
                color = Color.WHITE; textSize = 9f; typeface = Typeface.DEFAULT_BOLD; isAntiAlias = true
            }
            val rowPaint = Paint().apply { color = darkText; textSize = 9f; isAntiAlias = true }
            val rowPaintBold = Paint().apply {
                color = darkText; textSize = 9f; typeface = Typeface.DEFAULT_BOLD; isAntiAlias = true
            }
            val altPaint = Paint().apply { color = altRow; style = Paint.Style.FILL }
            val linePaint = Paint().apply { color = lightGray; style = Paint.Style.FILL }
            val headerBannerPaint = Paint().apply { color = red; style = Paint.Style.FILL }
            val titlePaint = Paint().apply {
                color = Color.WHITE; textSize = 18f; typeface = Typeface.DEFAULT_BOLD; isAntiAlias = true
            }
            val datePaint = Paint().apply {
                color = Color.WHITE; textSize = 10f; typeface = Typeface.DEFAULT; isAntiAlias = true
            }
            val dateStr = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(Date())

            fun drawHeader(canvas: Canvas) {
                canvas.drawRect(0f, 0f, 595f, 40f, headerBannerPaint)
                canvas.drawText("CELUACCEL — Historial de Eventos", 30f, 18f, titlePaint)
                canvas.drawText("Generado: $dateStr", 30f, 32f, datePaint)
            }

            fun drawTableHeader(canvas: Canvas, yPos: Float) {
                canvas.drawRect(x, yPos - 12f, x + colWidths.sum(), yPos + 6f, headerBg)
                var cx = x
                for (i in headers.indices) {
                    canvas.drawText(headers[i], cx + 3f, yPos + 1f, headerTextPaint)
                    cx += colWidths[i]
                }
            }

            var pageIdx = 0
            var page = pdfDocument.startPage(PdfDocument.PageInfo.Builder(595, 842, 1).create())
            var canvas = page.canvas
            drawHeader(canvas)
            var y = 60f
            drawTableHeader(canvas, y)
            y += 18f

            for ((idx, item) in items.withIndex()) {
                if (idx > 0 && idx % rowsPerPage == 0) {
                    pdfDocument.finishPage(page)
                    pageIdx++
                    page = pdfDocument.startPage(PdfDocument.PageInfo.Builder(595, 842, pageIdx + 1).create())
                    canvas = page.canvas
                    drawHeader(canvas)
                    y = 60f
                    drawTableHeader(canvas, y)
                    y += 18f
                }

                if (idx % 2 == 0) {
                    canvas.drawRect(x - 1f, y - 10f, x + colWidths.sum(), y + 8f, altPaint)
                }

                canvas.drawText(item.idHistorial?.toString() ?: "", x + 3f, y + 2f, rowPaintBold)
                canvas.drawText(item.idServicio.toString(), x + colWidths[0] + 3f, y + 2f, rowPaint)

                val fecha = item.fechaEvento?.let {
                    if (it.contains("T")) it.substringBefore("T") else it
                } ?: ""
                canvas.drawText(fecha, x + colWidths[0] + colWidths[1] + 3f, y + 2f, rowPaint)

                val desc = item.descripcionEvento ?: ""
                canvas.drawText(desc.take(55) + if (desc.length > 55) "..." else "", x + colWidths[0] + colWidths[1] + colWidths[2] + 3f, y + 2f, rowPaint)

                val est = when (item.estado) {
                    "1", "Activo" -> "Activo"
                    "0", "Inactivo" -> "Inactivo"
                    "Recibido", "Diagnostico", "Reparacion", "Control Calidad", "Listo", "Cancelado" -> item.estado!!
                    else -> item.estado ?: ""
                }
                canvas.drawText(est, x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 3f, y + 2f, rowPaint)

                canvas.drawRect(x - 1f, y + 8f, x + colWidths.sum(), y + 9f, linePaint)
                y += 18f
            }

            pdfDocument.finishPage(page)

            val fileName = "historial_celuaccel_${SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())}.pdf"
            val file = File(cacheDir, fileName)
            pdfDocument.writeTo(FileOutputStream(file))
            pdfDocument.close()

            val uri = FileProvider.getUriForFile(this, "${packageName}.provider", file)
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            startActivity(Intent.createChooser(shareIntent, "Guardar PDF en…"))

        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error al generar PDF: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}
