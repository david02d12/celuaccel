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

        // Nombre real del usuario (del JOIN con Usuario), sino fallback a ID
        val nombreMostrar = chat.nombreUsuario?.takeIf { it.isNotBlank() }
            ?: "Usuario: ${chat.idUsuario}"

        // Subtítulo: último mensaje o indicador de servicio
        val subtitulo = when {
            !chat.ultimoMensaje.isNullOrBlank()           -> chat.ultimoMensaje
            (chat.idServicio ?: 0) > 0                    -> "Servicio #${chat.idServicio}"
            else                                          -> "Sin mensajes aún"
        }

        // Hora del último mensaje (solo HH:mm si viene como ISO 8601)
        val hora = chat.fechaUltimoMensaje?.let { fecha ->
            when {
                fecha.contains("T") -> fecha.substringAfter("T").take(5)
                fecha.length >= 5   -> fecha.takeLast(5)
                else                -> ""
            }
        } ?: ""

        // Inicial del avatar
        val inicial = nombreMostrar.firstOrNull()?.uppercaseChar()?.toString() ?: "C"

        holder.tvNombreChat.text    = nombreMostrar
        holder.tvAvatarChat.text    = inicial
        holder.tvUltimoMensaje.text = subtitulo
        holder.tvHoraChat.text      = hora

        holder.itemView.setOnClickListener { onChatClick(chat) }
    }

    override fun getItemCount(): Int = chats.size
}