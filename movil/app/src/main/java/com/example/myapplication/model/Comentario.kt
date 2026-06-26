package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Comentario(
    @SerializedName("Codigo_Comentario") val codigoComentario: Int? = null,
    @SerializedName("ID_Servicio")       val idServicio: Int,
    @SerializedName("ID_Usuario")        val idUsuario: String? = null,
    @SerializedName("Comentario")        val comentario: String,
    @SerializedName("Calificacion")      val calificacion: Int? = null,   // 1-5 estrellas
    @SerializedName("Fecha")             val fecha: String? = null,
    @SerializedName("nombre_usuario")    val nombreUsuario: String? = null // campo JOIN del backend
)
