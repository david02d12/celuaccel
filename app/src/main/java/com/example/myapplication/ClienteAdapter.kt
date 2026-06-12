package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Cliente

class ClienteAdapter(
    private val clientes: List<Cliente>,
    private val onClick: ((Cliente) -> Unit)? = null
) : RecyclerView.Adapter<ClienteAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvInicial:  TextView = view.findViewById(R.id.tvClienteInicial)
        val tvNombre:   TextView = view.findViewById(R.id.tvClienteNombre)
        val tvDocumento:TextView = view.findViewById(R.id.tvClienteDocumento)
        val tvCorreo:   TextView = view.findViewById(R.id.tvClienteCorreo)
        val tvTelefono: TextView = view.findViewById(R.id.tvClienteTelefono)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_cliente, parent, false)
        return ViewHolder(v)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val c = clientes[position]
        holder.tvNombre.text    = c.nombre
        holder.tvDocumento.text = "ID: ${c.idUsuario}"
        holder.tvCorreo.text    = "✉ ${c.correo}"
        holder.tvTelefono.text  = "📞 ${c.telefono}"
        holder.tvInicial.text   = c.nombre.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
        holder.itemView.setOnClickListener { onClick?.invoke(c) }
    }

    override fun getItemCount(): Int = clientes.size
}