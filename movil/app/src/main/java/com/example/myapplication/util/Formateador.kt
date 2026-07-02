package com.example.myapplication.util

import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale

private val precioFormat = DecimalFormat("#,###", DecimalFormatSymbols(Locale("es", "CL")).apply {
    groupingSeparator = '.'
    decimalSeparator = ','
})

fun Double.formatearPrecio(): String = precioFormat.format(this)

fun mensajeErrorHttp(code: Int): String {
    val descripcion = when (code) {
        400 -> "Solicitud incorrecta"
        401 -> "No autorizado"
        403 -> "Acceso denegado"
        404 -> "No encontrado"
        405 -> "Método no permitido"
        408 -> "Tiempo de espera agotado"
        409 -> "Conflicto"
        410 -> "Ya no disponible"
        422 -> "Entidad no procesable"
        429 -> "Demasiadas solicitudes"
        500 -> "Error interno del servidor"
        502 -> "Puerta de enlace incorrecta"
        503 -> "Servicio no disponible"
        504 -> "Tiempo de espera del servidor"
        else -> "Error del servidor"
    }
    return "Error $code, $descripcion"
}
