package com.example.myapplication

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Notificacion


enum class TipoNotif(
    val colorHex:  String,
    val iconRes:   Int,
    val iconBgRes: Int
) {
    LISTO     ("#198754", R.drawable.ic_notif_check,  R.drawable.bg_notif_icon_green),
    CANCELADO ("#DB0000", R.drawable.ic_notif_cancel, R.drawable.bg_notif_icon_red),
    DIAGNOSTICO("#0D6EFD",R.drawable.ic_notif_search, R.drawable.bg_notif_icon_blue),
    REPARACION("#F59E0B", R.drawable.ic_notif_wrench, R.drawable.bg_notif_icon_amber),
    CALIDAD   ("#8B5CF6", R.drawable.ic_notif_beaker, R.drawable.bg_notif_icon_purple),
    INFO      ("#DB0000", R.drawable.ic_notif_bell,   R.drawable.bg_notif_icon_red)
}

private fun resolverTipo(texto: String): TipoNotif {
    val t = texto.lowercase()
    return when {
        t.contains("listo") || t.contains("retirar") || t.contains("entregado") -> TipoNotif.LISTO
        t.contains("cancel")   -> TipoNotif.CANCELADO
        t.contains("diagnos")  -> TipoNotif.DIAGNOSTICO
        t.contains("reparac")  -> TipoNotif.REPARACION
        t.contains("calidad") || t.contains("control")   -> TipoNotif.CALIDAD
        else  -> TipoNotif.INFO
    }
}

class NotificacionAdapter(
    private val items: MutableList<Notificacion>,
    private val onMarcarLeida: (Notificacion) -> Unit,
    private val onLongClick:   (Notificacion) -> Unit = {}
) : RecyclerView.Adapter<NotificacionAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val viewBorder: View      = v.findViewById(R.id.viewBorderLeft)
        val ivIcono:    ImageView = v.findViewById(R.id.ivIconoTipo)
        val tvTitulo:   TextView  = v.findViewById(R.id.tvTituloNotif)
        val tvBadge:    TextView  = v.findViewById(R.id.tvBadgeEstado)
        val tvMensaje:  TextView  = v.findViewById(R.id.tvMensajeNotif)
        val tvFecha:    TextView  = v.findViewById(R.id.tvFechaNotif)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notificacion, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val n = items[position]


        val titulo  = n.titulo ?: n.tipoNotificacion ?: "Notificación"
        val mensaje = n.mensaje ?: "—"
        val esLeida = n.leida == 1

        holder.tvTitulo.text  = titulo
        holder.tvMensaje.text = mensaje
        holder.tvFecha.text   = n.fechaNotificacion ?: n.fecha ?: ""

        val ctx = holder.itemView.context
        if (esLeida) {

            holder.viewBorder.setBackgroundColor(ContextCompat.getColor(ctx, R.color.celuaccel_border))
            holder.ivIcono.setImageResource(R.drawable.ic_notif_bell)
            holder.ivIcono.setBackgroundResource(R.drawable.bg_notif_icon_gray)
            holder.tvBadge.text = "LEÍDA"
            holder.tvBadge.setBackgroundResource(R.drawable.bg_badge_leida)
            holder.tvBadge.setTextColor(Color.WHITE)
            holder.tvTitulo.setTextColor(ContextCompat.getColor(ctx, R.color.celuaccel_text_muted))
            holder.tvMensaje.setTextColor(ContextCompat.getColor(ctx, R.color.celuaccel_text_light))
            holder.itemView.alpha = 0.62f
        } else {
            val tipo = resolverTipo(titulo)
            holder.viewBorder.setBackgroundColor(Color.parseColor(tipo.colorHex))
            holder.ivIcono.setImageResource(tipo.iconRes)
            holder.ivIcono.setBackgroundResource(tipo.iconBgRes)
            holder.tvBadge.text = "NUEVA"
            holder.tvBadge.setBackgroundResource(R.drawable.bg_badge_nueva)
            holder.tvBadge.setTextColor(Color.WHITE)
            holder.tvTitulo.setTextColor(ContextCompat.getColor(ctx, R.color.celuaccel_text))
            holder.tvMensaje.setTextColor(ContextCompat.getColor(ctx, R.color.celuaccel_text_muted))
            holder.itemView.alpha = 1.0f
        }


        holder.itemView.setOnClickListener     { onMarcarLeida(n) }
        holder.itemView.setOnLongClickListener { onLongClick(n); true }
    }

    override fun getItemCount(): Int = items.size
}
