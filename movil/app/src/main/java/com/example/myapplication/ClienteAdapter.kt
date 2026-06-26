package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.R
import com.example.myapplication.model.Cliente

class ClienteAdapter(
    private val clientes: List<Cliente>,
    private val onClick: (Cliente) -> Unit
) : RecyclerView.Adapter<ClienteAdapter.ClienteViewHolder>() {

    class ClienteViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        val tvAvatar: TextView = v.findViewById(R.id.tvAvatarCliente)
        val tvNombre: TextView = v.findViewById(R.id.tvNombreCliente)
        val tvDoc: TextView = v.findViewById(R.id.tvDocumentoCliente)
        val tvCorreo: TextView = v.findViewById(R.id.tvCorreoCliente)
        val tvBadgeRol: TextView = v.findViewById(R.id.tvBadgeRolCliente)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ClienteViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_cliente, parent, false)
        return ClienteViewHolder(view)
    }

    override fun onBindViewHolder(holder: ClienteViewHolder, position: Int) {
        val c = clientes[position]
        val ctx = holder.itemView.context

        holder.tvNombre.text = c.nombre
        holder.tvCorreo.text = c.correo

        val tipoDoc = when(c.codigoDocumento) {
            1 -> "CC"
            2 -> "CE"
            3 -> "NIT"
            else -> "Doc"
        }
        holder.tvDoc.text = "$tipoDoc — ${c.idUsuario}"

        holder.tvAvatar.text = if (c.nombre.isNotEmpty()) c.nombre.take(1).uppercase() else "👤"

        when(c.codigoRol) {
            3 -> {
                holder.tvBadgeRol.text = "Administrador"
                holder.tvBadgeRol.setBackgroundResource(R.drawable.bg_badge_cancelado)
                holder.tvBadgeRol.setTextColor(ContextCompat.getColor(ctx, R.color.etapa_cancelado_text))
            }
            1 -> {
                holder.tvBadgeRol.text = "Técnico"
                holder.tvBadgeRol.setBackgroundResource(R.drawable.bg_badge_reparacion)
                holder.tvBadgeRol.setTextColor(ContextCompat.getColor(ctx, R.color.etapa_reparacion_text))
            }
            2 -> {
                holder.tvBadgeRol.text = "Cliente"
                holder.tvBadgeRol.setBackgroundResource(R.drawable.bg_badge_recibido)
                holder.tvBadgeRol.setTextColor(ContextCompat.getColor(ctx, R.color.etapa_recibido_text))
            }
            else -> {
                holder.tvBadgeRol.text = "Rol ${c.codigoRol}"
                holder.tvBadgeRol.setBackgroundResource(R.drawable.bg_btn_outline)
                holder.tvBadgeRol.setTextColor(ContextCompat.getColor(ctx, R.color.celuaccel_text))
            }
        }

        holder.itemView.setOnClickListener { onClick(c) }
    }

    override fun getItemCount(): Int = clientes.size
}