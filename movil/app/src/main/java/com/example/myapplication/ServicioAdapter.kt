package com.example.myapplication

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Servicio

/**
 * Adapter para la lista de servicios.
 * Usa item_servicio.xml rediseñado al estilo web.
 *
 * @param servicios     Lista de servicios a mostrar
 * @param esCliente     true = rol cliente (muestra solo lo relevante para el cliente)
 * @param onCancelar    Callback al pulsar la card para cancelar
 * @param onChat        Callback al pulsar la card para abrir chat
 */
class ServicioAdapter(
    private val servicios: List<Servicio>,
    private val esCliente: Boolean = true,
    private val onCancelar: ((Servicio) -> Unit)? = null,
    private val onChat:     ((Servicio) -> Unit)? = null,
    private val onClick:    ((Servicio) -> Unit)? = null
) : RecyclerView.Adapter<ServicioAdapter.ViewHolder>() {

    // ─── Modelo de etapa con drawable de badge ────────────────────────────────
    data class EtapaInfo(
        val texto: String,
        val badgeDrawable: Int,
        val textColorAttr: Int,  // color resource id
        val porcentaje: Int,
        val progressColorRes: Int
    )

    private fun etapaInfo(etapa: Int): EtapaInfo = when {
        etapa == -1  -> EtapaInfo("Cancelado",            R.drawable.bg_badge_cancelado,    R.color.etapa_cancelado_text,    0,   R.color.etapa_cancelado_border)
        etapa == 0   -> EtapaInfo("Recibido",             R.drawable.bg_badge_recibido,     R.color.etapa_recibido_text,     5,   R.color.etapa_recibido_border)
        etapa <= 25  -> EtapaInfo("En Diagnóstico",       R.drawable.bg_badge_diagnostico,  R.color.etapa_diagnostico_text,  25,  R.color.etapa_diagnostico_border)
        etapa <= 50  -> EtapaInfo("En Reparación",        R.drawable.bg_badge_reparacion,   R.color.etapa_reparacion_text,   50,  R.color.etapa_reparacion_border)
        etapa <= 75  -> EtapaInfo("Control de Calidad",   R.drawable.bg_badge_calidad,      R.color.etapa_calidad_text,      75,  R.color.etapa_calidad_border)
        etapa == 100 -> EtapaInfo("Listo para Retirar",   R.drawable.bg_badge_listo,        R.color.etapa_listo_text,        100, R.color.etapa_listo_border)
        else         -> EtapaInfo("En proceso ($etapa%)", R.drawable.bg_badge_reparacion,   R.color.etapa_reparacion_text,   etapa, R.color.etapa_reparacion_border)
    }

    // ─── ViewHolder ───────────────────────────────────────────────────────────
    inner class ViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        val tvIdServicio:       TextView    = v.findViewById(R.id.tvIdServicio)
        val tvBadgeEtapa:       TextView    = v.findViewById(R.id.tvBadgeEtapa)
        val tvDispositivo:      TextView    = v.findViewById(R.id.tvDispositivo)
        val tvDescripcion:      TextView    = v.findViewById(R.id.tvDescripcionServicio)
        val progressEtapa:      ProgressBar = v.findViewById(R.id.progressEtapa)
        val tvFecha:            TextView    = v.findViewById(R.id.tvFechaServicio)
        val tvPrecio:           TextView    = v.findViewById(R.id.tvPrecioServicio)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_servicio, parent, false)
        return ViewHolder(v)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val s    = servicios[position]
        val info = etapaInfo(s.etapa)
        val ctx  = holder.itemView.context

        // ID
        holder.tvIdServicio.text = "#${s.idServicio ?: (position + 1)}"

        // Badge de etapa con drawable de color correcto
        holder.tvBadgeEtapa.text = info.texto
        holder.tvBadgeEtapa.background = ContextCompat.getDrawable(ctx, info.badgeDrawable)
        holder.tvBadgeEtapa.setTextColor(ContextCompat.getColor(ctx, info.textColorAttr))

        // Dispositivo
        holder.tvDispositivo.text = buildString {
            append(s.movilNombre.ifEmpty { "Dispositivo sin nombre" })
            if (s.movilEspecificacion.isNotEmpty()) append(" — ${s.movilEspecificacion}")
        }

        // Descripción
        holder.tvDescripcion.text = s.descripcion.ifEmpty { "Sin descripción" }

        // Barra de progreso
        if (s.etapa == -1) {
            holder.progressEtapa.visibility = View.INVISIBLE
        } else {
            holder.progressEtapa.visibility = View.VISIBLE
            holder.progressEtapa.progress   = info.porcentaje
            holder.progressEtapa.progressTintList =
                ColorStateList.valueOf(ContextCompat.getColor(ctx, info.progressColorRes))
        }

        // Fecha
        val fechaStr = s.fecha.takeIf { it.length >= 10 }?.substring(0, 10) ?: s.fecha
        holder.tvFecha.text = "📅 $fechaStr"

        // Precio
        holder.tvPrecio.text = if (s.precio > 0) "$${"%.0f".format(s.precio)}" else "Por definir"

        // Click en la card
        holder.itemView.setOnClickListener { onClick?.invoke(s) }
        holder.itemView.setOnLongClickListener {
            onCancelar?.invoke(s)
            true
        }
    }

    override fun getItemCount(): Int = servicios.size
}