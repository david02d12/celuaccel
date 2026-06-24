package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Producto(
    @SerializedName("Codigo_Producto") val codigoProducto: String,
    @SerializedName("Cantidad") val cantidad: Int,
    @SerializedName("Precio") val precio: Double,
    @SerializedName("Nombre") val nombre: String,
    @SerializedName("Descripcion") val descripcion: String?,
    @SerializedName("Imagen") val imagen: String?,
    @SerializedName("Activo_Catalogo") val activoCatalogo: Int,
    @SerializedName("ID_Categoria") val idCategoria: Int?
)
