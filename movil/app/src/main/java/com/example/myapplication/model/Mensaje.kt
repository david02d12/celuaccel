package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Mensaje(
    @SerializedName("Codigo_Mensaje") val codigoMensaje: Int? = null,
    @SerializedName("Codigo_Chat") val codigoChat: Int,
    @SerializedName("ID_Usuario") val idUsuario: String,
    @SerializedName("Fecha_Mensaje") val fechaMensaje: String,
    @SerializedName("Mensaje") val mensaje: String,
    @SerializedName("Estado") val estado: Int? = 1,
    @SerializedName("dueno") val dueno: String? = null,
    @SerializedName("rol") val rol: Int? = null
)
