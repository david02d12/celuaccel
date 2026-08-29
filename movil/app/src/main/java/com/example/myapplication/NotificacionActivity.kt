package com.example.myapplication

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.api.ApiClient
import com.example.myapplication.api.ApiService
import com.example.myapplication.model.Notificacion
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class NotificacionActivity : AppCompatActivity() {

    private lateinit var token: String
    private var userRole: Int = 2

    private lateinit var recyclerView:       RecyclerView
    private lateinit var tvConteo:           TextView
    private lateinit var btnFiltroTodas:     Button
    private lateinit var btnFiltroNuevas:    Button
    private lateinit var btnFiltroLeidas:    Button
    private lateinit var viewEstadoVacio:    LinearLayout
    private lateinit var tvVacioTitulo:      TextView
    private lateinit var tvVacioDesc:        TextView

    private val api by lazy { ApiClient.retrofit.create(ApiService::class.java) }


    private var listaCompleta: MutableList<Notificacion> = mutableListOf()


    private var filtroActual = "todas"


    private val colorActivo   = Color.parseColor("#DB0000")
    private val colorInactivo = Color.parseColor("#6C757D")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notificacion)

        val prefs = getSharedPreferences("app", MODE_PRIVATE)
        val raw   = prefs.getString("token", "") ?: ""
        token     = if (raw.startsWith("Bearer ")) raw else "Bearer $raw"
        userRole  = prefs.getInt("user_role", 2)


        recyclerView     = findViewById(R.id.recyclerNotificaciones)
        tvConteo         = findViewById(R.id.tvConteoNotif)
        btnFiltroTodas   = findViewById(R.id.btnFiltroTodas)
        btnFiltroNuevas  = findViewById(R.id.btnFiltroNuevas)
        btnFiltroLeidas  = findViewById(R.id.btnFiltroLeidas)
        viewEstadoVacio  = findViewById(R.id.viewEstadoVacio)
        tvVacioTitulo    = findViewById(R.id.tvEstadoVacioTitulo)
        tvVacioDesc      = findViewById(R.id.tvEstadoVacioDesc)

        recyclerView.layoutManager = LinearLayoutManager(this)


        findViewById<Button>(R.id.btnRegresar).setOnClickListener { finish() }


        val btnNuevaNotificacion = findViewById<Button>(R.id.btnNuevaNotificacion)
        if (userRole != 2) {
            btnNuevaNotificacion.visibility = View.VISIBLE
            btnNuevaNotificacion.setOnClickListener { mostrarDialogoNuevaNotificacion() }
        } else {
            btnNuevaNotificacion.visibility = View.GONE
        }


        btnFiltroTodas.setOnClickListener  { aplicarFiltro("todas") }
        btnFiltroNuevas.setOnClickListener { aplicarFiltro("nuevas") }
        btnFiltroLeidas.setOnClickListener { aplicarFiltro("leidas") }

        cargarNotificaciones()
    }

    private fun cargarNotificaciones() {

        listOf(btnFiltroTodas, btnFiltroNuevas, btnFiltroLeidas).forEach { it.isEnabled = false }

        val call: Call<List<Notificacion>> = if (userRole == 2) {
            api.getMisNotificaciones(token)
        } else {
            api.getNotificaciones(token)
        }

        call.enqueue(object : Callback<List<Notificacion>> {
            override fun onResponse(
                call: Call<List<Notificacion>>,
                response: Response<List<Notificacion>>
            ) {

                listOf(btnFiltroTodas, btnFiltroNuevas, btnFiltroLeidas).forEach { it.isEnabled = true }

                if (response.isSuccessful && response.body() != null) {
                    listaCompleta = response.body()!!.toMutableList()
                    actualizarConteo()
                    mostrarFiltrado()
                } else {
                    Toast.makeText(
                        this@NotificacionActivity,
                        "Error al cargar notificaciones (${response.code()})",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onFailure(call: Call<List<Notificacion>>, t: Throwable) {
                listOf(btnFiltroTodas, btnFiltroNuevas, btnFiltroLeidas).forEach { it.isEnabled = true }
                Toast.makeText(
                    this@NotificacionActivity,
                    "Error de red: ${t.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        })
    }


    private fun aplicarFiltro(filtro: String) {
        filtroActual = filtro
        actualizarPills()
        mostrarFiltrado()
    }

    private fun mostrarFiltrado() {
        val lista = when (filtroActual) {
            "nuevas"  -> listaCompleta.filter { it.leida != 1 }
            "leidas"  -> listaCompleta.filter { it.leida == 1 }
            else      -> listaCompleta
        }.toMutableList()


        if (lista.isEmpty()) {
            viewEstadoVacio.visibility  = View.VISIBLE
            recyclerView.visibility     = View.GONE
            val (titulo, desc) = when (filtroActual) {
                "nuevas" -> Pair("Todo al día", "No tienes notificaciones sin leer.")
                "leidas" -> Pair("Sin leídas",  "Ninguna notificación marcada como leída.")
                else     -> Pair("Sin mensajes", "No tienes notificaciones en este momento.")
            }
            tvVacioTitulo.text = titulo
            tvVacioDesc.text   = desc
        } else {
            viewEstadoVacio.visibility = View.GONE
            recyclerView.visibility    = View.VISIBLE
        }

        val adapter = NotificacionAdapter(
            lista,
            onMarcarLeida = { notif ->
                if (userRole == 2) {
                    notif.codigoNotificaciones?.let { id -> marcarLeida(id) }
                }
            },
            onLongClick = { notif ->
                if (userRole != 2) {
                    notif.codigoNotificaciones?.let { id ->
                        androidx.appcompat.app.AlertDialog.Builder(this)
                            .setTitle("Eliminar Notificación")
                            .setMessage("¿Eliminar esta notificación?")
                            .setPositiveButton("Eliminar") { _, _ -> eliminarNotificacion(id) }
                            .setNegativeButton("Cancelar", null)
                            .show()
                    }
                }
            }
        )
        recyclerView.adapter = adapter


        val bgEliminar = ColorDrawable(Color.parseColor("#DB0000"))
        val bgLeida    = ColorDrawable(Color.parseColor("#198754"))
        val iconEliminar = ContextCompat.getDrawable(this, R.drawable.ic_delete_white)
        val iconLeida    = ContextCompat.getDrawable(this, R.drawable.ic_notif_check)
        val paintText = Paint().apply {
            color = Color.WHITE
            textSize = 36f
            isAntiAlias = true
        }

        val swipeCallback = object : ItemTouchHelper.SimpleCallback(
            0,
            ItemTouchHelper.LEFT or (if (userRole == 2) ItemTouchHelper.RIGHT else 0)
        ) {
            override fun onMove(rv: RecyclerView, vh: RecyclerView.ViewHolder, t: RecyclerView.ViewHolder) = false

            override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
                val pos   = viewHolder.adapterPosition
                val notif = lista[pos]
                val id    = notif.codigoNotificaciones ?: return

                if (direction == ItemTouchHelper.LEFT) {

                    if (userRole == 2) {
                        marcarLeida(id)
                    } else {
                        androidx.appcompat.app.AlertDialog.Builder(this@NotificacionActivity)
                            .setTitle("Eliminar Notificación")
                            .setMessage("¿Seguro que deseas eliminar esta notificación?")
                            .setPositiveButton("Eliminar") { _, _ -> eliminarNotificacion(id) }
                            .setNegativeButton("Cancelar") { _, _ -> adapter.notifyItemChanged(pos) }
                            .setOnCancelListener    { adapter.notifyItemChanged(pos) }
                            .show()
                    }
                } else if (direction == ItemTouchHelper.RIGHT && userRole == 2) {
                    marcarLeida(id)
                }
            }

            override fun onChildDraw(
                c: Canvas, recyclerView: RecyclerView,
                viewHolder: RecyclerView.ViewHolder,
                dX: Float, dY: Float, actionState: Int, isCurrentlyActive: Boolean
            ) {
                val itemView = viewHolder.itemView
                val iconMargin = (itemView.height - 64) / 2

                if (dX < 0) {
                    bgEliminar.setBounds(itemView.right + dX.toInt(), itemView.top, itemView.right, itemView.bottom)
                    bgEliminar.draw(c)
                    iconEliminar?.let {
                        it.setBounds(
                            itemView.right - iconMargin - 64,
                            itemView.top + iconMargin,
                            itemView.right - iconMargin,
                            itemView.bottom - iconMargin
                        )
                        it.draw(c)
                    }
                } else if (dX > 0) {
                    bgLeida.setBounds(itemView.left, itemView.top, itemView.left + dX.toInt(), itemView.bottom)
                    bgLeida.draw(c)
                    iconLeida?.let {
                        it.setBounds(
                            itemView.left + iconMargin,
                            itemView.top + iconMargin,
                            itemView.left + iconMargin + 64,
                            itemView.bottom - iconMargin
                        )
                        it.draw(c)
                    }
                }
                super.onChildDraw(c, recyclerView, viewHolder, dX, dY, actionState, isCurrentlyActive)
            }
        }

        ItemTouchHelper(swipeCallback).attachToRecyclerView(recyclerView)
    }

    private fun actualizarPills() {
        val inactive = listOf(btnFiltroTodas, btnFiltroNuevas, btnFiltroLeidas)
        inactive.forEach { btn ->
            btn.setBackgroundResource(R.drawable.bg_btn_outline)
            btn.setTextColor(colorInactivo)
        }
        val active = when (filtroActual) {
            "nuevas"  -> btnFiltroNuevas
            "leidas"  -> btnFiltroLeidas
            else      -> btnFiltroTodas
        }
        active.setBackgroundResource(R.drawable.bg_btn_primary)
        active.setTextColor(Color.WHITE)
    }

    private fun actualizarConteo() {
        val total   = listaCompleta.size
        val noLeidas = listaCompleta.count { it.leida != 1 }
        tvConteo.text = if (noLeidas > 0)
            "$total notificaciones · $noLeidas sin leer"
        else
            "$total notificaciones"
    }


    private fun marcarLeida(id: Int) {
        api.marcarNotificacionLeida(token, id).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) cargarNotificaciones()
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@NotificacionActivity, "Error al marcar como leída", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun eliminarNotificacion(id: Int) {
        api.eliminarNotificacion(token, id).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@NotificacionActivity, "Notificación eliminada", Toast.LENGTH_SHORT).show()
                    cargarNotificaciones()
                } else {
                    Toast.makeText(this@NotificacionActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@NotificacionActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun mostrarDialogoNuevaNotificacion() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_nueva_notificacion, null)
        val etTitulo       = dialogView.findViewById<EditText>(R.id.etTituloNotif)
        val etMensaje      = dialogView.findViewById<EditText>(R.id.etMensajeNotif)
        val etDestinatario = dialogView.findViewById<EditText>(R.id.etDestinatarioNotif)
        val btnEnviar      = dialogView.findViewById<Button>(R.id.btnEnviarNotif)
        val btnCancelar    = dialogView.findViewById<Button>(R.id.btnCancelarNotif)
        val btnCerrar      = dialogView.findViewById<android.widget.ImageButton>(R.id.btnCerrarDialog)

        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setView(dialogView)
            .create()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnCerrar.setOnClickListener  { dialog.dismiss() }
        btnCancelar.setOnClickListener{ dialog.dismiss() }

        btnEnviar.setOnClickListener {
            val destino = etDestinatario.text.toString().trim()
            val titulo  = etTitulo.text.toString().trim()
            val mensaje = etMensaje.text.toString().trim()

            if (destino.isEmpty() || mensaje.isEmpty()) {
                Toast.makeText(this, "Destinatario y mensaje son obligatorios", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val nuevaNotif = Notificacion(
                idUsuarioDestino = destino,
                titulo           = titulo.ifEmpty { "Notificación" },
                mensaje          = mensaje
            )

            api.enviarNotificacion(token, nuevaNotif).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@NotificacionActivity, "Notificación enviada", Toast.LENGTH_SHORT).show()
                        dialog.dismiss()
                        cargarNotificaciones()
                    } else {
                        Toast.makeText(this@NotificacionActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@NotificacionActivity, "Error de red", Toast.LENGTH_SHORT).show()
                }
            })
        }

        dialog.show()
    }
}
