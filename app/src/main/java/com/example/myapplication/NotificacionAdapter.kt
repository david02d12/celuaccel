package com.example.myapplication

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Notificacion

class NotificacionAdapter(
    private val items: MutableList<Notificacion>,
    private val onMarcarLeida: (Notificacion) -> Unit
) : RecyclerView.Adapter<NotificacionAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvTitulo:   TextView    = v.findViewById(R.id.tvTituloNotificacion)
        val tvMensaje:  TextView    = v.findViewById(R.id.tvMensajeNotificacion)
        val tvFecha:    TextView    = v.findViewById(R.id.tvFechaNotificacion)
        val indicador:  View        = v.findViewById(R.id.viewIndicadorLeida)
        val btnLeida:   ImageButton = v.findViewById(R.id.btnMarcarLeida)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_notificacion, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val n = items[position]

        holder.tvTitulo.text  = n.titulo  ?: n.tipoNotificacion ?: "Notificación"
        holder.tvMensaje.text = n.mensaje ?: "—"
        holder.tvFecha.text   = n.fechaNotificacion ?: n.fecha ?: ""

        // Estilo según estado de lectura
        val esLeida = n.leida == 1
        holder.indicador.setBackgroundColor(if (esLeida) Color.LTGRAY else Color.parseColor("#D32F2F"))
        holder.tvTitulo.setTextColor(if (esLeida) Color.GRAY else Color.parseColor("#212121"))
        holder.itemView.alpha = if (esLeida) 0.7f else 1.0f

        // Solo mostrar botón si no está leída
        holder.btnLeida.visibility = if (esLeida) View.GONE else View.VISIBLE
        holder.btnLeida.setOnClickListener { onMarcarLeida(n) }
    }

    override fun getItemCount(): Int = items.size
}
