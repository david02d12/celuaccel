package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Servicio(
    @SerializedName("ID_Servicio")
    val idServicio: Int? = null,

    @SerializedName("Descripcion")
    val descripcion: String? = null,

    @SerializedName("ID_Usuario")
    val idUsuario: String? = null,

    @SerializedName("Precio")
    val precio: Double? = null,

    @SerializedName("Movil_Nombre")
    val movilNombre: String? = null,

    @SerializedName("Movil_Especificacion")
    val movilEspecificacion: String? = null,

    @SerializedName("Fecha")
    val fecha: String? = null,

    @SerializedName("Etapa")
    val etapa: Int? = null
)