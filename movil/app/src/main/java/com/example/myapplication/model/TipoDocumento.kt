package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class TipoDocumento(
    // Backend devuelve y espera estos campos exactos
    @SerializedName("Codigo_Documento")  val codigoDocumento: Int? = null,
    @SerializedName("Nombre_Documento")  val nombreDocumento: String = ""
)
