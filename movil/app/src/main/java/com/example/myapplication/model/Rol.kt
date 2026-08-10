package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Rol(
    @SerializedName("Codigo_Rol")  val codigoRol: String,
    @SerializedName("Nombre_Rol")  val nombreRol: String
)
