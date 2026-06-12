package com.example.myapplication.api

import com.example.myapplication.model.Categoria
import com.example.myapplication.model.ChangePasswordRequest
import com.example.myapplication.model.Chat
import com.example.myapplication.model.Cliente
import com.example.myapplication.model.Comentario
import com.example.myapplication.model.ForgotPasswordRequest
import com.example.myapplication.model.Historial
import com.example.myapplication.model.LoginRequest
import com.example.myapplication.model.LoginResponse
import com.example.myapplication.model.Mensaje
import com.example.myapplication.model.Notificacion
import com.example.myapplication.model.Pregunta
import com.example.myapplication.model.Producto
import com.example.myapplication.model.Rol
import com.example.myapplication.model.Servicio
import com.example.myapplication.model.TipoDocumento
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // ===== AUTENTICACIÓN =====

    @POST("login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @POST("registro")
    fun createCliente(@Body cliente: Cliente): Call<Void>

    @POST("forgot-password")
    fun forgotPassword(@Body request: ForgotPasswordRequest): Call<Void>

    @POST("change-password")
    fun changePassword(
        @Header("Authorization") token: String,
        @Body request: ChangePasswordRequest
    ): Call<Void>

    // ===== USUARIOS / PERFIL =====

    /** Perfil público de cualquier usuario */
    @GET("usuarios/perfil/{id}")
    fun getPerfil(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Call<Cliente>

    /** Actualizar mi propio perfil */
    @PUT("usuarios/mi-perfil")
    fun actualizarMiPerfil(
        @Header("Authorization") token: String,
        @Body cliente: Cliente
    ): Call<Void>

    /** Listar todos los usuarios (Admin) */
    @GET("usuarios/listar")
    fun getClientes(@Header("Authorization") token: String): Call<List<Cliente>>

    /** Actualizar usuario por body (Admin) */
    @PUT("usuarios/actualizar")
    fun updateCliente(
        @Header("Authorization") token: String,
        @Body cliente: Cliente
    ): Call<Void>

    /** Actualizar usuario por ID en URL (Admin) */
    @PUT("usuarios/actualizar/{id}")
    fun updateClientePorId(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body cliente: Cliente
    ): Call<Void>

    /** Eliminar usuario (Admin) */
    @DELETE("usuarios/eliminar/{id}")
    fun deleteCliente(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Call<Void>

    // ===== SERVICIOS =====

    @GET("servicios/listar")
    fun getServicios(@Header("Authorization") token: String): Call<List<Servicio>>

    @GET("servicios/listar-mios")
    fun getMisServicios(@Header("Authorization") token: String): Call<List<Servicio>>

    @GET("servicios/mis-servicios/{idUsuario}")
    fun getServiciosDeUsuario(
        @Header("Authorization") token: String,
        @Path("idUsuario") idUsuario: String
    ): Call<List<Servicio>>

    @POST("servicios/agregar")
    fun agregarServicio(
        @Header("Authorization") token: String,
        @Body servicio: Servicio
    ): Call<Void>

    @PUT("servicios/actualizar")
    fun actualizarServicio(
        @Header("Authorization") token: String,
        @Body servicio: Servicio
    ): Call<Void>

    @PATCH("servicios/cancelar/{id}")
    fun cancelarServicio(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<Void>

    @DELETE("servicios/eliminar/{id}")
    fun deleteServicio(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<Void>

    // ===== HISTORIAL =====

    @GET("historial/listar")
    fun getHistorial(@Header("Authorization") token: String): Call<List<Historial>>

    @POST("historial/agregar")
    fun agregarHistorial(
        @Header("Authorization") token: String,
        @Body historial: Historial
    ): Call<Void>

    // ===== PRODUCTOS =====

    /** Productos públicos — sin autenticación */
    @GET("productos/publico")
    fun getProductosPublicos(): Call<List<Producto>>

    /** Todos los productos (autenticado) */
    @GET("productos/listar")
    fun getProductos(@Header("Authorization") token: String): Call<List<Producto>>

    @POST("productos/agregar")
    fun agregarProducto(
        @Header("Authorization") token: String,
        @Body producto: Producto
    ): Call<Void>

    @PUT("productos/actualizar")
    fun actualizarProducto(
        @Header("Authorization") token: String,
        @Body producto: Producto
    ): Call<Void>

    @DELETE("productos/eliminar/{id}")
    fun deleteProducto(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Call<Void>

    // ===== CATEGORÍAS =====

    @GET("categorias/publico")
    fun getCategoriasPublicas(): Call<List<Categoria>>

    @GET("categorias/listar")
    fun getCategorias(@Header("Authorization") token: String): Call<List<Categoria>>

    @POST("categorias/agregar")
    fun agregarCategoria(
        @Header("Authorization") token: String,
        @Body categoria: Categoria
    ): Call<Void>

    @PUT("categorias/actualizar")
    fun actualizarCategoria(
        @Header("Authorization") token: String,
        @Body categoria: Categoria
    ): Call<Void>

    @DELETE("categorias/eliminar/{id}")
    fun deleteCategoria(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<Void>

    // ===== PREGUNTAS =====

    /** Mis preguntas (cliente) */
    @GET("preguntas/mis-preguntas")
    fun getMisPreguntas(@Header("Authorization") token: String): Call<List<Pregunta>>

    /** Todas las preguntas (Admin/Técnico) */
    @GET("preguntas/listar")
    fun getPreguntas(@Header("Authorization") token: String): Call<List<Pregunta>>

    @POST("preguntas/agregar")
    fun agregarPregunta(
        @Header("Authorization") token: String,
        @Body pregunta: Pregunta
    ): Call<Void>

    @PUT("preguntas/actualizar")
    fun actualizarPregunta(
        @Header("Authorization") token: String,
        @Body pregunta: Pregunta
    ): Call<Void>

    @DELETE("preguntas/eliminar/{id}")
    fun deletePregunta(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<Void>

    // ===== CHATS =====

    @GET("chats/listar-mios")
    fun getMisChats(@Header("Authorization") token: String): Call<List<Chat>>

    @GET("chats/listar")
    fun getChats(@Header("Authorization") token: String): Call<List<Chat>>

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

    // ===== COMENTARIOS =====

    @GET("comentarios/listar")
    fun getComentarios(@Header("Authorization") token: String): Call<List<Comentario>>

    @POST("comentarios/agregar")
    fun agregarComentario(
        @Header("Authorization") token: String,
        @Body comentario: Comentario
    ): Call<Void>

    @DELETE("comentarios/eliminar/{id}")
    fun deleteComentario(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<Void>

    // ===== NOTIFICACIONES =====

    /** Mis notificaciones (con filtro opcional noLeidas) */
    @GET("notificaciones/mis-notificaciones")
    fun getMisNotificaciones(
        @Header("Authorization") token: String,
        @Query("noLeidas") noLeidas: Boolean? = null
    ): Call<List<Notificacion>>

    /** Conteo de notificaciones no leídas (para badge) */
    @GET("notificaciones/no-leidas/count")
    fun getConteoNoLeidas(@Header("Authorization") token: String): Call<Map<String, Int>>

    /** Marcar una notificación como leída */
    @PATCH("notificaciones/marcar-leida/{id}")
    fun marcarNotificacionLeida(
        @Header("Authorization") token: String,
        @Path("id") idNotificacion: Int
    ): Call<Void>

    /** Marcar TODAS las notificaciones como leídas */
    @PATCH("notificaciones/marcar-todas-leidas")
    fun marcarTodasLeidas(@Header("Authorization") token: String): Call<Void>

    /** Todas las notificaciones (Admin/Técnico) */
    @GET("notificaciones/listar")
    fun getNotificaciones(@Header("Authorization") token: String): Call<List<Notificacion>>

    /** Enviar notificación a usuario (Admin/Técnico) */
    @POST("notificaciones/enviar")
    fun enviarNotificacion(
        @Header("Authorization") token: String,
        @Body notificacion: Notificacion
    ): Call<Void>

    // ===== ROLES =====

    @GET("roles/listar")
    fun getRoles(@Header("Authorization") token: String): Call<List<Rol>>

    @POST("roles/agregar")
    fun agregarRol(
        @Header("Authorization") token: String,
        @Body rol: Rol
    ): Call<Void>

    @PUT("roles/actualizar")
    fun actualizarRol(
        @Header("Authorization") token: String,
        @Body rol: Rol
    ): Call<Void>

    @DELETE("roles/eliminar/{id}")
    fun deleteRol(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Call<Void>

    // ===== TIPO DOCUMENTO =====

    @GET("tipodocumento/listar")
    fun getTiposDocumento(@Header("Authorization") token: String): Call<List<TipoDocumento>>
}