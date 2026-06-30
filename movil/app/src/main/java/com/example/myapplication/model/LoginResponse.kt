package com.example.myapplication.model

data class LoginResponse (
    val auth: Boolean,
    val token: String,
    val user: String,
    val nombre: String? = null,
    val role: Int
)