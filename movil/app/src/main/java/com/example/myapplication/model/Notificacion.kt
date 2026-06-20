package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Notificacion(
    @SerializedName("Codigo_Notificaciones") val codigoNotificaciones: Int? = null,

    // El backend devuelve ID_Usuario_Destino como ID_Usuario también
    @SerializedName("ID_Usuario")            val idUsuario: String? = null,
    @SerializedName("ID_Usuario_Destino")    val idUsuarioDestino: String? = null,

    // Tipo_Notificacion es el campo principal de texto en la BD
    @SerializedName("Tipo_Notificacion")     val tipoNotificacion: String? = null,

    // Titulo y Mensaje vienen del campo Tipo_Notificacion mapeado en el service
    @SerializedName("Titulo")                val titulo: String? = null,
    @SerializedName("Mensaje")               val mensaje: String? = null,

    // Leida llega como 0 o 1 (Int) desde la BD
    @SerializedName("Leida")                 val leida: Int? = 0,

    // Fechas con ambos nombres por compatibilidad
    @SerializedName("Fecha_Notificacion")    val fechaNotificacion: String? = null,
    @SerializedName("Fecha")                 val fecha: String? = null,

    // Campos para el envío de notificaciones dirigidas
    @SerializedName("ID_Servicio")           val idServicio: String? = null
)
