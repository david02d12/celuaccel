package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Rol(
    @SerializedName("Codigo_Rol")      val codigoRol: String,
    @SerializedName("Descripcion_Rol") val descripcionRol: String
)
