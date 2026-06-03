package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Chat(
    @SerializedName("Codigo_Chat") val codigoChat: Int? = null,
    @SerializedName("ID_Usuario") val idUsuario: String,
    @SerializedName("ID_Servicio") val idServicio: Int
)
