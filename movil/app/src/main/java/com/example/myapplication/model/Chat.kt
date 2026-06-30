package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Chat(
    @SerializedName("Codigo_Chat")          val codigoChat: Int? = null,
    @SerializedName("ID_Usuario")           val idUsuario: String? = null,
    @SerializedName("ID_Servicio")          val idServicio: Int? = null,
    @SerializedName("Nombre_Usuario")       val nombreUsuario: String? = null,
    @SerializedName("Ultimo_Mensaje")       val ultimoMensaje: String? = null,
    @SerializedName("Fecha_Ultimo_Mensaje") val fechaUltimoMensaje: String? = null,
    @SerializedName("Servicio_Descripcion") val servicioDescripcion: String? = null,
    @SerializedName("Servicio_Movil")       val servicioMovil: String? = null
)
