package com.example.myapplication.model

import com.google.gson.annotations.SerializedName

data class ServicioResponse(
    @SerializedName("message") val message: String? = null,
    @SerializedName("id") val id: Int? = null
)
