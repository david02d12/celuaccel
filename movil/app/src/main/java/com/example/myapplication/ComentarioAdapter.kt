package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Comentario

class ComentarioAdapter(
    private val items: List<Comentario>,
    private val currentUserId:   String = "",
    private val currentUserRole: Int    = 2,
    private val onDelete: ((Comentario) -> Unit)? = null,
    private val onEdit:   ((Comentario) -> Unit)? = null
) : RecyclerView.Adapter<ComentarioAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        // IDs del nuevo item_comentario.xml
        val tvAvatarComentario: TextView = v.findViewById(R.id.tvAvatarComentario)
        val tvNombreComentario: TextView = v.findViewById(R.id.tvNombreComentario)
        val tvFechaComentario:  TextView = v.findViewById(R.id.tvFechaComentario)
        val tvEstrellas:        TextView = v.findViewById(R.id.tvEstrellas)
        val tvTextoComentario:  TextView = v.findViewById(R.id.tvTextoComentario)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_comentario, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val c      = items[position]
        val nombre = c.nombreUsuario ?: c.idUsuario ?: "Usuario"

        holder.tvNombreComentario.text  = nombre
        holder.tvAvatarComentario.text  = nombre.firstOrNull()?.uppercaseChar()?.toString() ?: "U"
        holder.tvFechaComentario.text   = c.fecha ?: ""
        holder.tvTextoComentario.text   = c.comentario

        // Estrellas con emojis (calificacion 1-5)
        val rating  = (c.calificacion ?: 5).coerceIn(1, 5)
        val llenas  = "⭐".repeat(rating)
        val vacías  = "☆".repeat(5 - rating)
        holder.tvEstrellas.text = "$llenas$vacías"

        // Long click para editar/eliminar (si es dueño o admin)
        val esDuenio = c.idUsuario == currentUserId
        val esAdmin  = currentUserRole == 3
        if (esDuenio || esAdmin) {
            holder.itemView.setOnLongClickListener {
                if (esDuenio) onEdit?.invoke(c) else onDelete?.invoke(c)
                true
            }
        }
    }

    override fun getItemCount(): Int = items.size
}
