package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Servicio(
    @SerializedName("ID_Servicio")
    val idServicio: Int? = null,

    @SerializedName("Descripcion")
    val descripcion: String,

    @SerializedName("ID_Usuario")
    val idUsuario: String,

    @SerializedName("Precio")
    val precio: Double,

    @SerializedName("Movil_Nombre")
    val movilNombre: String,

    @SerializedName("Movil_Especificacion")
    val movilEspecificacion: String,

    @SerializedName("Fecha")
    val fecha: String,

    @SerializedName("Etapa")
    val etapa: Int
)