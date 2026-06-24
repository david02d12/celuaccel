package com.example.myapplication.model

data class ResetPasswordRequest(
    val token: String,
    val newPassword: String
)
