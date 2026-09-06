package com.example.myapplication.model

data class ChangePasswordRequest(
    val oldPassword: String,
    val newPassword: String
)
