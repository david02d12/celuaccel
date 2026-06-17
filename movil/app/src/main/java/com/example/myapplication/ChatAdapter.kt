package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Chat

class ChatAdapter(
    private val chats: List<Chat>,
    private val onChatClick: (Chat) -> Unit
) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        // IDs del nuevo item_chat.xml
        val tvAvatarChat:     TextView = view.findViewById(R.id.tvAvatarChat)
        val tvNombreChat:     TextView = view.findViewById(R.id.tvNombreChat)
        val tvUltimoMensaje:  TextView = view.findViewById(R.id.tvUltimoMensaje)
        val tvHoraChat:       TextView = view.findViewById(R.id.tvHoraChat)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_chat, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val chat = chats[position]

        // Nombre: preferir nombre de usuario si existe, sino "Servicio #ID"
        // Chat model solo tiene idUsuario e idServicio
        val nombre = "Usuario: ${chat.idUsuario}"
        holder.tvNombreChat.text    = "Servicio #${chat.idServicio}"
        holder.tvAvatarChat.text    = chat.idUsuario.firstOrNull()?.uppercaseChar()?.toString() ?: "C"
        holder.tvUltimoMensaje.text = "Chat con ${chat.idUsuario}"
        holder.tvHoraChat.text      = ""

        holder.itemView.setOnClickListener { onChatClick(chat) }
    }

    override fun getItemCount(): Int = chats.size
}
