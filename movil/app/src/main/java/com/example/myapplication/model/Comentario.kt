package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Comentario(
    @SerializedName("Codigo_Comentario") val codigoComentario: Int? = null,
    @SerializedName("ID_Usuario")        val idUsuario: String = "",
    @SerializedName("Comentario")        val comentario: String = "",
    @SerializedName("Fecha_Comentario")  val fechaComentario: String? = null,
    @SerializedName("Estrellas")         val estrellas: Int = 5
)
