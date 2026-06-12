package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class TipoDocumento(
    @SerializedName("Codigo_Tipo_Documento") val codigoTipoDocumento: Int? = null,
    @SerializedName("Nombre")                val nombre: String,
    @SerializedName("Abreviatura")           val abreviatura: String? = null
)
