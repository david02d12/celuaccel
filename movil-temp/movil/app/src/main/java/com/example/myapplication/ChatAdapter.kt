package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Chat

class ChatAdapter(
    private val listaChats: List<Chat>,
    private val mapasNombresClientes: Map<String, String>, // ID_Usuario -> Nombre
    private val mapasNombreMoviles: Map<Int, String>,     // ID_Servicio -> Movil_Nombre
    private val onClick: (Chat) -> Unit
) : RecyclerView.Adapter<ChatAdapter.ChatViewHolder>() {

    class ChatViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        val tvAvatar: TextView = v.findViewById(R.id.tvAvatarChat)
        val tvNombre: TextView = v.findViewById(R.id.tvNombreChat)
        val tvUltimoMsg: TextView = v.findViewById(R.id.tvUltimoMensaje)
        val tvHora: TextView = v.findViewById(R.id.tvHoraChat)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_chat, parent, false)
        return ChatViewHolder(view)
    }

    override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
        val chat = listaChats[position]

        // Cruzar datos: Buscar el nombre del cliente usando su ID_Usuario
        val nombreCliente = mapasNombresClientes[chat.idUsuario] ?: "Usuario (${chat.idUsuario})"

        // Cruzar datos: Buscar el nombre del celular usando el ID_Servicio
        val dispositivo = if (chat.idServicio != null) {
            mapasNombreMoviles[chat.idServicio] ?: "Servicio #${chat.idServicio}"
        } else {
            "Consulta general"
        }

        // Asignar los textos reales al diseño
        holder.tvNombre.text = nombreCliente
        holder.tvUltimoMsg.text = "Dispositivo: $dispositivo"

        // Colocar la inicial del cliente en el avatar circular
        holder.tvAvatar.text = if (nombreCliente.isNotEmpty()) nombreCliente.take(1).uppercase() else "💬"

        // Usar la hora para pintar el ID del Chat para control interno del técnico/admin
        holder.tvHora.text = "N° ${chat.codigoChat ?: 0}"

        holder.itemView.setOnClickListener { onClick(chat) }
    }

    override fun getItemCount(): Int = listaChats.size
}