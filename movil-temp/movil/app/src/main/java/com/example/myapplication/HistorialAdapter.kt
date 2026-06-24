package com.example.myapplication

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Historial

class HistorialAdapter(
    private var items: List<Historial>,
    private val onClick: ((Historial) -> Unit)? = null
) : RecyclerView.Adapter<HistorialAdapter.VH>() {

    fun updateList(newList: List<Historial>) {
        items = newList
        notifyDataSetChanged()
    }

    // ─── Mismo mapa de etapas que ServicioAdapter ─────────────────────────────
    data class EtapaInfo(
        val texto: String,
        val badgeDrawable: Int,
        val textColorRes: Int,
        val porcentaje: Int,
        val progressColorRes: Int
    )

    private fun etapaInfo(etapa: Int): EtapaInfo = when {
        etapa == -1  -> EtapaInfo("Cancelado",          R.drawable.bg_badge_cancelado,   R.color.etapa_cancelado_text,   0,   R.color.etapa_cancelado_border)
        etapa == 0   -> EtapaInfo("Recibido",           R.drawable.bg_badge_recibido,    R.color.etapa_recibido_text,    5,   R.color.etapa_recibido_border)
        etapa <= 25  -> EtapaInfo("Diagnóstico",        R.drawable.bg_badge_diagnostico, R.color.etapa_diagnostico_text, 25,  R.color.etapa_diagnostico_border)
        etapa <= 50  -> EtapaInfo("Reparación",         R.drawable.bg_badge_reparacion,  R.color.etapa_reparacion_text,  50,  R.color.etapa_reparacion_border)
        etapa <= 75  -> EtapaInfo("Control Calidad",    R.drawable.bg_badge_calidad,     R.color.etapa_calidad_text,     75,  R.color.etapa_calidad_border)
        etapa == 100 -> EtapaInfo("Listo",              R.drawable.bg_badge_listo,       R.color.etapa_listo_text,       100, R.color.etapa_listo_border)
        else         -> EtapaInfo("En proceso",         R.drawable.bg_badge_reparacion,  R.color.etapa_reparacion_text,  etapa, R.color.etapa_reparacion_border)
    }

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvIdHistorial:       TextView    = v.findViewById(R.id.tvIdHistorial)
        val tvEtapaHistorial:    TextView    = v.findViewById(R.id.tvEtapaHistorial)
        val tvDispositivoHistorial: TextView = v.findViewById(R.id.tvDispositivoHistorial)
        val tvDescHistorial:     TextView    = v.findViewById(R.id.tvDescHistorial)
        val progressHistorial:   ProgressBar = v.findViewById(R.id.progressHistorial)
        val tvFechaHistorial:    TextView    = v.findViewById(R.id.tvFechaHistorial)
        val tvPrecioHistorial:   TextView    = v.findViewById(R.id.tvPrecioHistorial)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_historial, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val h   = items[position]
        val ctx = holder.itemView.context

        // Determinar etapa desde el campo Estado (puede ser "0","25","50","75","100","-1","Activo", etc.)
        val etapaNum = when {
            h.estado == null                               -> 0
            h.estado.toIntOrNull() != null                 -> h.estado.toInt()
            h.estado.equals("Listo", ignoreCase = true)    -> 100
            h.estado.equals("Activo", ignoreCase = true)   -> 50
            h.estado.equals("Cancelado", ignoreCase = true)-> -1
            else                                           -> 0
        }
        val info = etapaInfo(etapaNum)

        holder.tvIdHistorial.text = "Servicio #${h.idServicio}"

        holder.tvEtapaHistorial.text       = info.texto
        holder.tvEtapaHistorial.background = ContextCompat.getDrawable(ctx, info.badgeDrawable)
        holder.tvEtapaHistorial.setTextColor(ContextCompat.getColor(ctx, info.textColorRes))

        // Dispositivo — no disponible en modelo, usamos descripción truncada
        holder.tvDispositivoHistorial.text = h.descripcionEvento.take(40)
        holder.tvDescHistorial.text        = h.descripcionEvento

        // Barra de progreso
        holder.progressHistorial.progress = info.porcentaje
        holder.progressHistorial.progressTintList =
            ColorStateList.valueOf(ContextCompat.getColor(ctx, info.progressColorRes))

        // Fecha
        val fechaStr = h.fechaEvento
        holder.tvFechaHistorial.text = "📅 ${if (fechaStr.contains("T")) fechaStr.substringBefore("T") else fechaStr}"

        // Precio — no disponible en modelo de historial, se oculta
        holder.tvPrecioHistorial.visibility = View.GONE

        holder.itemView.setOnClickListener { onClick?.invoke(h) }
    }

    override fun getItemCount(): Int = items.size
}
