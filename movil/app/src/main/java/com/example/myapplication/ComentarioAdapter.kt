package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Comentario

class ComentarioAdapter(
    private val items: List<Comentario>,
    private val currentUserId: String = "",
    private val currentUserRole: Int = 2,
    private val onDelete: ((Comentario) -> Unit)? = null,
    private val onEdit: ((Comentario) -> Unit)? = null
) : RecyclerView.Adapter<ComentarioAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvAvatar: TextView = v.findViewById(R.id.tvAvatarComentario)
        val tvNombre: TextView = v.findViewById(R.id.tvNombreComentario)
        val tvFecha: TextView = v.findViewById(R.id.tvFechaComentario)
        val tvTexto: TextView = v.findViewById(R.id.tvTextoComentario)
        val starContainer: LinearLayout = v.findViewById(R.id.starContainer)
        val actionButtons: LinearLayout = v.findViewById(R.id.actionButtons)
        val btnEdit: TextView = v.findViewById(R.id.btnEditComentario)
        val btnDelete: TextView = v.findViewById(R.id.btnDeleteComentario)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_comentario, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val c = items[position]
        val nombre = if (c.idUsuario.isNotBlank()) c.idUsuario else "Usuario"
        val inicial = nombre.firstOrNull()?.uppercaseChar() ?: 'U'

        holder.tvAvatar.text = inicial.toString()
        holder.tvNombre.text = nombre
        holder.tvFecha.text = c.fechaComentario?.takeIf { it.isNotBlank() }?.let {
            if (it.contains("T")) it.substringBefore("T") else it
        } ?: ""
        holder.tvTexto.text = "\"${c.comentario}\""


        val rating = c.estrellas.coerceIn(1, 5)
        holder.starContainer.removeAllViews()
        for (i in 1..5) {
            val star = TextView(holder.itemView.context).apply {
                text = if (i <= rating) "★" else "☆"
                textSize = 16f
                setTextColor(0xFFFFD700.toInt())
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            }
            holder.starContainer.addView(star)
        }


        val esDuenio = c.idUsuario == currentUserId
        val esTecnico = currentUserRole == 3
        if (esDuenio || esTecnico) {
            holder.actionButtons.visibility = View.VISIBLE
            if (esDuenio) {
                holder.btnEdit.visibility = View.VISIBLE
                holder.btnEdit.setOnClickListener { onEdit?.invoke(c) }
            } else {
                holder.btnEdit.visibility = View.GONE
            }
            holder.btnDelete.setOnClickListener { onDelete?.invoke(c) }
        } else {
            holder.actionButtons.visibility = View.GONE
        }
    }

    override fun getItemCount(): Int = items.size
}
