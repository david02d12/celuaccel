package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Chat(
    @SerializedName("Codigo_Chat")          val codigoChat: Int? = null,
    @SerializedName("ID_Usuario")           val idUsuario: String,
    @SerializedName("ID_Servicio")          val idServicio: Int? = null,     // nullable: chats de catálogo no tienen servicio
    @SerializedName("Nombre_Usuario")       val nombreUsuario: String? = null,
    @SerializedName("Ultimo_Mensaje")       val ultimoMensaje: String? = null,
    @SerializedName("Fecha_Ultimo_Mensaje") val fechaUltimoMensaje: String? = null
)
