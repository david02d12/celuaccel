package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Historial(
    @SerializedName("ID_Historial") val idHistorial: Int? = null,
    @SerializedName("ID_Servicio") val idServicio: Int,
    @SerializedName("Fecha_Evento") val fechaEvento: String,
    @SerializedName("Descripcion_Evento") val descripcionEvento: String,
    @SerializedName("Estado") val estado: String? = null
)
