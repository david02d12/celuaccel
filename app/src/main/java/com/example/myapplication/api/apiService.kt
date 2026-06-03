package com.example.myapplication.api

import com.example.myapplication.model.Categoria
import com.example.myapplication.model.Cliente
import com.example.myapplication.model.LoginRequest
import com.example.myapplication.model.LoginResponse
import com.example.myapplication.model.Pregunta
import com.example.myapplication.model.Producto
import com.example.myapplication.model.Servicio
import com.example.myapplication.model.Chat
import com.example.myapplication.model.Mensaje
import com.example.myapplication.model.Historial
import com.example.myapplication.model.Notificacion
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface ApiService {

    // AUTENTICACIÓN Y USUARIOS
    @POST("login")
    fun login(
        @Body request: LoginRequest
    ): Call<LoginResponse>

    // CREAR CLIENTE / REGISTRO
    @POST("registro")
    fun createCliente(
        @Body cliente: Cliente
    ): Call<Void>

    // LISTAR CLIENTES
    @GET("usuarios/listar")
    fun getClientes(
        @Header("Authorization") token: String
    ): Call<List<Cliente>>

    // ACTUALIZAR USUARIO
    @PUT("usuarios/actualizar")
    fun updateCliente(
        @Header("Authorization") token: String,
        @Body cliente: Cliente
    ): Call<Void>

    // ELIMINAR USUARIO
    @DELETE("usuarios/eliminar/{id}")
    fun deleteCliente(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Call<Void>

    // LISTAR TODOS LOS SERVICIOS
    @GET("servicios/listar")
    fun getServicios(
        @Header("Authorization") token: String
    ): Call<List<Servicio>>

    // MIS SERVICIOS
    @GET("servicios/mis-servicios/{idUsuario}")
    fun getMisServicios(
        @Header("Authorization") token: String,
        @Path("idUsuario") idUsuario: String
    ): Call<List<Servicio>>

    // AGREGAR SERVICIO
    @POST("servicios/agregar")
    fun agregarServicio(
        @Header("Authorization") token: String,
        @Body servicio: Servicio
    ): Call<Void>

    // ACTUALIZAR SERVICIO
    @PUT("servicios/actualizar")
    fun actualizarServicio(
        @Header("Authorization") token: String,
        @Body servicio: Servicio
    ): Call<Void>

    // CANCELAR SERVICIO
    @PATCH("servicios/cancelar/{id}")
    fun cancelarServicio(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<Void>

    // ELIMINAR SERVICIO
    @DELETE("servicios/eliminar/{id}")
    fun deleteServicio(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<Void>

    // ===== MÓDULO CATÁLOGO DE PRODUCTOS =====

    // LISTAR TODOS LOS PRODUCTOS (admin/interno)
    @GET("productos/listar")
    fun getProductos(
        @Header("Authorization") token: String
    ): Call<List<Producto>>

    // BUSCAR PRODUCTO POR ID
    @GET("productos/buscar/{id}")
    fun getProductoPorId(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Call<Producto>

    // AGREGAR PRODUCTO
    @POST("productos/agregar")
    fun agregarProducto(
        @Header("Authorization") token: String,
        @Body producto: Producto
    ): Call<Void>

    // ACTUALIZAR PRODUCTO
    @PUT("productos/actualizar")
    fun actualizarProducto(
        @Header("Authorization") token: String,
        @Body producto: Producto
    ): Call<Void>

    // ELIMINAR PRODUCTO
    @DELETE("productos/eliminar/{id}")
    fun deleteProducto(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Call<Void>

    // ===== CATEGORÍAS =====
    @GET("categorias/listar")
    fun getCategorias(
        @Header("Authorization") token: String
    ): Call<List<Categoria>>

    // ===== PREGUNTAS =====
    @GET("preguntas/listar")
    fun getPreguntas(
        @Header("Authorization") token: String
    ): Call<List<Pregunta>>

    @POST("preguntas/agregar")
    fun agregarPregunta(
        @Header("Authorization") token: String,
        @Body pregunta: Pregunta
    ): Call<Void>

    // ===== CHATS =====
    @GET("chats/listar-mios")
    fun getMisChats(
        @Header("Authorization") token: String
    ): Call<List<Chat>>

    @POST("chats/crear")
    fun crearChat(
        @Header("Authorization") token: String,
        @Body chat: Chat
    ): Call<Void>

    // ===== MENSAJES =====
    @GET("mensajes/por-chat/{id}")
    fun getMensajesPorChat(
        @Header("Authorization") token: String,
        @Path("id") idChat: Int
    ): Call<List<Mensaje>>

    @POST("mensajes/agregar")
    fun enviarMensaje(
        @Header("Authorization") token: String,
        @Body mensaje: Mensaje
    ): Call<Void>

    // ===== HISTORIAL =====
    @GET("historial/listar")
    fun getHistorial(
        @Header("Authorization") token: String
    ): Call<List<Historial>>

    // ===== NOTIFICACIONES =====
    @GET("notificaciones/mis-notificaciones")
    fun getMisNotificaciones(
        @Header("Authorization") token: String
    ): Call<List<Notificacion>>

    @PATCH("notificaciones/marcar-leida/{id}")
    fun marcarNotificacionLeida(
        @Header("Authorization") token: String,
        @Path("id") idNotificacion: Int
    ): Call<Void>
}