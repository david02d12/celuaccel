package com.example.myapplication

import android.content.Intent
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Servicio

class ServicioAdapter(
    private val servicios: List<Servicio>,
    private val onClick: ((Servicio) -> Unit)? = null
) : RecyclerView.Adapter<ServicioAdapter.ViewHolder>() {

    /** Etiqueta legible para el número de etapa */
    private fun etapaTexto(etapa: Int) = when (etapa) {
        -1   -> "❌ Cancelado"
        0    -> "📥 Recibido"
        1    -> "🔍 En revisión"
        2    -> "🔧 En reparación"
        3    -> "✅ Listo para entregar"
        4    -> "📦 Entregado"
        else -> "Etapa $etapa"
    }

    private fun etapaColor(etapa: Int) = when (etapa) {
        -1   -> Color.parseColor("#D32F2F")
        3, 4 -> Color.parseColor("#2E7D32")
        else -> Color.parseColor("#1565C0")
    }

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNombre:  TextView = view.findViewById(R.id.tvServicioNombre)
        val tvDesc:    TextView = view.findViewById(R.id.tvServicioDesc)
        val tvPrecio:  TextView = view.findViewById(R.id.tvServicioPrecio)
        val tvEtapa:   TextView = view.findViewById(R.id.tvServicioEtapa)
        val tvFecha:   TextView = view.findViewById(R.id.tvServicioFecha)
        val tvUsuario: TextView = view.findViewById(R.id.tvServicioUsuario)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_servicio, parent, false)
        return ViewHolder(v)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val s = servicios[position]
        holder.tvNombre.text  = s.movilNombre.ifEmpty { "Dispositivo sin nombre" }
        holder.tvDesc.text    = s.descripcion
        holder.tvPrecio.text  = if (s.precio > 0) "$${"%.2f".format(s.precio)}" else "Precio por definir"
        holder.tvEtapa.text   = etapaTexto(s.etapa)
        holder.tvEtapa.setTextColor(etapaColor(s.etapa))
        holder.tvFecha.text   = "📅 ${s.fecha}"
        holder.tvUsuario.text = "👤 ${s.idUsuario}"

        holder.itemView.setOnClickListener { onClick?.invoke(s) }
    }

    override fun getItemCount(): Int = servicios.size
}