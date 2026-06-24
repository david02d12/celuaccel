package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Notificacion

class NotificacionAdapter(
    private val items: MutableList<Notificacion>,
    private val onMarcarLeida: (Notificacion) -> Unit,
    private val onLongClick:   (Notificacion) -> Unit = {}
) : RecyclerView.Adapter<NotificacionAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        // IDs del nuevo item_notificacion.xml
        val dotNoLeida:   View        = v.findViewById(R.id.dotNoLeida)
        val tvTitulo:     TextView    = v.findViewById(R.id.tvTituloNotif)
        val tvMensaje:    TextView    = v.findViewById(R.id.tvMensajeNotif)
        val tvFecha:      TextView    = v.findViewById(R.id.tvFechaNotif)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notificacion, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val n = items[position]

        holder.tvTitulo.text  = n.titulo  ?: n.tipoNotificacion ?: "Notificación"
        holder.tvMensaje.text = n.mensaje ?: "—"

        // Fecha relativa simple
        holder.tvFecha.text = n.fechaNotificacion ?: n.fecha ?: ""

        // Punto rojo de "no leída"
        val esLeida = n.leida == 1
        holder.dotNoLeida.visibility = if (esLeida) View.INVISIBLE else View.VISIBLE
        holder.itemView.alpha        = if (esLeida) 0.65f else 1.0f

        // Marcar leída al hacer clic
        holder.itemView.setOnClickListener {
            onMarcarLeida(n)
        }

        // Long click para eliminar
        holder.itemView.setOnLongClickListener {
            onLongClick(n)
            true
        }
    }

    override fun getItemCount(): Int = items.size
}
