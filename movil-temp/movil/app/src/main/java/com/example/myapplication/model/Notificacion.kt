package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Notificacion(
    @SerializedName("Codigo_Notificaciones") val codigoNotificaciones: Int? = null,
    @SerializedName("ID_Usuario")           val idUsuario: String? = null,
    @SerializedName("Tipo_Notificacion")    val tipoNotificacion: String? = null,
    @SerializedName("Titulo")               val titulo: String? = null,
    @SerializedName("Mensaje")              val mensaje: String? = null,
    @SerializedName("Leida")                val leida: Int? = 0,
    @SerializedName("Fecha")                val fecha: String? = null,
    @SerializedName("Fecha_Notificacion")   val fechaNotificacion: String? = null,
    
    // Campos para el envío
    @SerializedName("ID_Usuario_Destino")   val idUsuarioDestino: String? = null,
    @SerializedName("ID_Servicio")          val idServicio: String? = null
)
