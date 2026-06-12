package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Notificacion(
    @SerializedName("Codigo_Notificaciones") val codigoNotificaciones: Int? = null,
    @SerializedName("ID_Usuario")           val idUsuario: String? = null,
    @SerializedName("Tipo_Notificacion")    val tipoNotificacion: String? = null,
    @SerializedName("Titulo")               val titulo: String? = null,
    @SerializedName("Mensaje")              val mensaje: String? = null,
    @SerializedName("Leida")               val leida: Int? = 0,       // 0 = no leída, 1 = leída
    @SerializedName("Fecha")               val fecha: String? = null,
    @SerializedName("Fecha_Notificacion")  val fechaNotificacion: String? = null
)
