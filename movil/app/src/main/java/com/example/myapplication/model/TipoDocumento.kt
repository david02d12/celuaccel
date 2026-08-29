package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class TipoDocumento(
    @SerializedName("Codigo_Documento")  val codigoDocumento: Int? = null,
    @SerializedName("Tipo_Documento")    val tipoDocumento: String = ""
)
