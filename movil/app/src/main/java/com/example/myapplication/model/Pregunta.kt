package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Pregunta(
    @SerializedName("ID_Consulta")      val idConsulta: Int? = null,
    @SerializedName("ID_Usuario")       val idUsuario: String,
    @SerializedName("Codigo_Producto")  val codigoProducto: String = "",
    @SerializedName("Pregunta")         val pregunta: String,
    @SerializedName("Fecha")            val fecha: String,
    @SerializedName("Respuesta")        val respuesta: String? = null,
    @SerializedName("nombre_usuario")   val nombreUsuario: String? = null,
    @SerializedName("ID_Tecnico_Responde") val idTecnicoResponde: String? = null,
    @SerializedName("Fecha_Respuesta")  val fechaRespuesta: String? = null
)
