package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Notificacion(
    @SerializedName("Codigo_Notificaciones") val codigoNotificaciones: Int? = null,
    @SerializedName("Tipo_Notificacion") val tipoNotificacion: String? = null 
)
