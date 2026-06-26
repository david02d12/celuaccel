package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class Cliente(
    @SerializedName("ID_Usuario") val idUsuario: String,
    @SerializedName("Codigo_Documento") val codigoDocumento: Int,
    @SerializedName("Nombre") val nombre: String,
    @SerializedName("Fecha_Nacimiento") val fechaNacimiento: String,
    @SerializedName("Direccion") val direccion: String,
    @SerializedName("Telefono") val telefono: String,
    @SerializedName("Correo") val correo: String,
    @SerializedName("Clave") val clave: String, // Mira si tu backend espera "Contrasenia", "Clave" o "Contrasena"
    @SerializedName("Codigo_Rol") val codigoRol: Int
)