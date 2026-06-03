package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Categoria(
    @SerializedName("ID_Categoria") val idCategoria: Int,
    @SerializedName("Nombre_Categoria") val nombreCategoria: String
)
