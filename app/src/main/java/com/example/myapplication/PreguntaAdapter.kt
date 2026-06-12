package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Pregunta

class PreguntaAdapter(
    private val items: List<Pregunta>
) : RecyclerView.Adapter<PreguntaAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvTexto:     TextView     = v.findViewById(R.id.tvPreguntaTexto)
        val tvFecha:     TextView     = v.findViewById(R.id.tvFechaPregunta)
        val tvRespuesta: TextView     = v.findViewById(R.id.tvRespuestaPregunta)
        val layoutResp:  LinearLayout = v.findViewById(R.id.layoutRespuesta)
        val tvSinResp:   TextView     = v.findViewById(R.id.tvSinRespuesta)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_pregunta, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val p = items[position]
        holder.tvTexto.text = p.pregunta
        holder.tvFecha.text = p.fecha

        // Mostrar respuesta si existe (campo "Respuesta" del backend)
        val respuesta = p.respuesta
        if (!respuesta.isNullOrEmpty()) {
            holder.layoutResp.visibility = View.VISIBLE
            holder.tvSinResp.visibility  = View.GONE
            holder.tvRespuesta.text      = respuesta
        } else {
            holder.layoutResp.visibility = View.GONE
            holder.tvSinResp.visibility  = View.VISIBLE
        }
    }

    override fun getItemCount(): Int = items.size
}
