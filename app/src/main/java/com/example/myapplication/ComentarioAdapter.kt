package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.RatingBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Comentario

class ComentarioAdapter(
    private val items: List<Comentario>
) : RecyclerView.Adapter<ComentarioAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvInicial:   TextView  = v.findViewById(R.id.tvInicialComentario)
        val tvNombre:    TextView  = v.findViewById(R.id.tvNombreComentario)
        val tvTexto:     TextView  = v.findViewById(R.id.tvTextoComentario)
        val tvFecha:     TextView  = v.findViewById(R.id.tvFechaComentario)
        val ratingBar:   RatingBar = v.findViewById(R.id.ratingBarItemComentario)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_comentario, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val c = items[position]
        val nombre = c.nombreUsuario ?: c.idUsuario ?: "Usuario"

        holder.tvNombre.text     = nombre
        holder.tvInicial.text    = nombre.firstOrNull()?.uppercaseChar()?.toString() ?: "U"
        holder.tvTexto.text      = c.comentario
        holder.tvFecha.text      = c.fecha ?: ""
        holder.ratingBar.rating  = (c.calificacion ?: 5).toFloat()
    }

    override fun getItemCount(): Int = items.size
}
