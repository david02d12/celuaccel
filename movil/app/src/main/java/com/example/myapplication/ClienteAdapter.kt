package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Cliente

class ClienteAdapter(
    private var clientes: MutableList<Cliente>,
    private val onClick: ((Cliente) -> Unit)? = null
) : RecyclerView.Adapter<ClienteAdapter.ViewHolder>() {

    fun actualizarLista(nuevaLista: MutableList<Cliente>) {
        clientes = nuevaLista
        notifyDataSetChanged()
    }

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        // IDs del nuevo item_cliente.xml
        val tvAvatarCliente:   TextView = view.findViewById(R.id.tvAvatarCliente)
        val tvNombreCliente:   TextView = view.findViewById(R.id.tvNombreCliente)
        val tvDocumentoCliente:TextView = view.findViewById(R.id.tvDocumentoCliente)
        val tvRolCliente:      TextView = view.findViewById(R.id.tvRolCliente)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_cliente, parent, false)
        return ViewHolder(v)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val c = clientes[position]

        holder.tvNombreCliente.text    = c.nombre
        holder.tvDocumentoCliente.text = "Doc: ${c.idUsuario}"
        holder.tvAvatarCliente.text    = c.nombre.firstOrNull()?.uppercaseChar()?.toString() ?: "?"

        // Badge de rol textual
        holder.tvRolCliente.text = when (c.codigoRol) {
            1    -> "Técnico"
            3    -> "Admin"
            else -> "Cliente"
        }

        holder.itemView.setOnClickListener { onClick?.invoke(c) }
    }

    override fun getItemCount(): Int = clientes.size
}