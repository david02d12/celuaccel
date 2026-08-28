package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Chat

class ChatAdapter(
    private val chats: List<Chat>,
    private val userRole: Int,
    private val onChatClick: (Chat) -> Unit
) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvAvatarChat:     TextView = view.findViewById(R.id.tvAvatarChat)
        val tvNombreChat:     TextView = view.findViewById(R.id.tvNombreChat)
        val tvUltimoMensaje:  TextView = view.findViewById(R.id.tvUltimoMensaje)
        val tvHoraChat:       TextView = view.findViewById(R.id.tvHoraChat)
        val tvEstadoChat:     TextView = view.findViewById(R.id.tvEstadoChat)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_chat, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val chat = chats[position]

        val idDisplay = chat.idUsuario?.takeIf { it.isNotBlank() } ?: "?"

        val nombreMostrar = if (userRole == 2) {
            chat.nombreUsuario?.takeIf { it.isNotBlank() } ?: "Soporte (Chat #${chat.codigoChat ?: idDisplay})"
        } else {
            chat.nombreUsuario?.takeIf { it.isNotBlank() } ?: "Usuario: $idDisplay"
        }

        val servicioInfo = when {
            chat.servicioMovil?.isNotBlank() == true -> chat.servicioMovil
            chat.servicioDescripcion?.isNotBlank() == true -> chat.servicioDescripcion
            else -> null
        }
        val subtitulo = when {
            !chat.ultimoMensaje.isNullOrBlank() -> chat.ultimoMensaje
            (chat.idServicio ?: 0) > 0 && servicioInfo != null -> "Servicio #${chat.idServicio}: $servicioInfo"
            (chat.idServicio ?: 0) > 0 -> "Servicio #${chat.idServicio}"
            else -> "Consulta de catálogo"
        }

        val hora = chat.fechaUltimoMensaje?.let { fecha ->
            when {
                fecha.contains("T") -> fecha.substringAfter("T").take(5)
                fecha.length >= 5 -> fecha.takeLast(5)
                else -> ""
            }
        } ?: ""

        val inicial = nombreMostrar.firstOrNull()?.uppercaseChar()?.toString() ?: "?"

        holder.tvNombreChat.text = nombreMostrar
        holder.tvAvatarChat.text = inicial
        holder.tvUltimoMensaje.text = subtitulo
        holder.tvHoraChat.text = hora

        // Badge de estado: solo lo ve el admin/técnico cuando el chat está Oculto
        val estaOculto = chat.estadoChat?.equals("Oculto", ignoreCase = true) == true
        if (estaOculto && userRole != 2) {
            holder.tvEstadoChat.visibility = View.VISIBLE
        } else {
            holder.tvEstadoChat.visibility = View.GONE
        }

        holder.itemView.setOnClickListener { onChatClick(chat) }
    }

    override fun getItemCount(): Int = chats.size
}
