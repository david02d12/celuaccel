package com.example.myapplication.model

/**
 * Body enviado a POST /reset-password/{token}
 * El token va en la URL (path param), solo se envía la nueva contraseña en el body.
 */
data class ResetPasswordRequest(
    val newPassword: String
)
