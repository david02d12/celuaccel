package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Pregunta

class PreguntaAdapter(
    private val items: List<Pregunta>,
    private val currentUserId:   String = "",
    private val currentUserRole: Int    = 2,
    private val onDelete:  ((Pregunta) -> Unit)? = null,
    private val onRespond: ((Pregunta) -> Unit)? = null
) : RecyclerView.Adapter<PreguntaAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {

        val tvTituloPregunta:   TextView    = v.findViewById(R.id.tvTituloPregunta)
        val tvContenidoPregunta:TextView    = v.findViewById(R.id.tvContenidoPregunta)
        val tvExpandir:         TextView    = v.findViewById(R.id.tvExpandir)
        val tvFechaPregunta:    TextView    = v.findViewById(R.id.tvFechaPregunta)
        val separadorRespuesta: View        = v.findViewById(R.id.separadorRespuesta)
        val layoutRespuesta:    LinearLayout= v.findViewById(R.id.layoutRespuesta)
        val tvRespuestaPregunta:TextView    = v.findViewById(R.id.tvRespuestaPregunta)
        val btnResponder:       Button      = v.findViewById(R.id.btnResponder)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_pregunta, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val p = items[position]


        holder.tvTituloPregunta.text    = p.pregunta.take(70)
        holder.tvContenidoPregunta.text = p.pregunta
        holder.tvFechaPregunta.text     = p.fecha ?: ""


        val respuesta = p.respuesta
        if (!respuesta.isNullOrEmpty()) {
            holder.separadorRespuesta.visibility  = View.VISIBLE
            holder.layoutRespuesta.visibility     = View.VISIBLE
            holder.tvRespuestaPregunta.text       = respuesta
            holder.tvExpandir.text                = "▲"
        } else {
            holder.separadorRespuesta.visibility  = View.GONE
            holder.layoutRespuesta.visibility     = View.GONE
            holder.tvExpandir.text                = "▼"
        }


        val puedeResponder = currentUserRole != 2 && onRespond != null
        holder.btnResponder.visibility = if (puedeResponder) View.VISIBLE else View.GONE
        if (puedeResponder) {
            holder.btnResponder.setOnClickListener { onRespond?.invoke(p) }
        }


        val esDuenio = p.idUsuario == currentUserId
        val esAdmin  = currentUserRole == 3
        if ((esDuenio || esAdmin) && onDelete != null) {
            holder.itemView.setOnLongClickListener {
                onDelete.invoke(p)
                true
            }
        }
    }

    override fun getItemCount(): Int = items.size
}
