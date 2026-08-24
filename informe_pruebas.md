# Informe Completo de Pruebas — Proyecto CeluAccel

**Fecha de ejecución:** 23/08/2026  
**Proyecto:** CeluAccel — Sistema de gestión de servicios de reparación de celulares  
**Stack:** Backend (Node.js/Express + MySQL) · Frontend (React/Vite) · Tiempo real (Socket.IO)  
**Framework de testing:** Jest (unitarias + integración) · WebdriverIO (E2E)

### Resultado General

| Métrica | Valor |
|---|---|
| **Test Suites** | 26 passed, 26 total |
| **Tests** | 227 passed, 227 total |
| **Failures** | 0 |
| **Tiempo total** | 6.529 s |

---

## 1. Pruebas Unitarias

### 1.1 Services — `auth.service.test.js`

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-001 | AuthService | `registro` | Rechazar registro sin campos obligatorios. | `{}` (sin ID_Usuario, Nombre, Correo, Clave) | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-002 | AuthService | `registro` | Rechazar contraseña menor a 6 caracteres. | `Clave: "abc"` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-003 | AuthService | `registro` | Registrar usuario correctamente con hash bcrypt. | Datos válidos completos | Invoca `usuarioDao.create` con hash | Hash generado, create invocado | 🟢 Pass | | Jest log |
| UNIT-004 | AuthService | `registro` | Rechazar usuario duplicado (ER_DUP_ENTRY). | Email ya existente | AppError 409 | AppError 409 lanzado | 🟢 Pass | | Jest log |
| UNIT-005 | AuthService | `login` | Rechazar si faltan credenciales. | `user:"", password:""` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-006 | AuthService | `login` | Rechazar si el usuario no existe. | `user:"noexiste"` | AppError 401 | AppError 401 lanzado | 🟢 Pass | | Jest log |
| UNIT-007 | AuthService | `login` | Rechazar si la contraseña es incorrecta. | Password incorrecto (bcrypt no coincide) | AppError 401 | AppError 401 lanzado | 🟢 Pass | | Jest log |
| UNIT-008 | AuthService | `login` | Retornar token y datos si credenciales son correctas. | Credenciales válidas | `{ auth:true, token, user, nombre, role }` | Objeto retornado correctamente | 🟢 Pass | | Jest log |
| UNIT-009 | AuthService | `changePassword` | Rechazar si faltan campos. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-010 | AuthService | `changePassword` | Rechazar si contraseña actual incorrecta. | `oldPassword:"wrong"` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-011 | AuthService | `changePassword` | Cambiar contraseña si todo es correcto. | Datos válidos | `updatePassword` invocado | updatePassword invocado | 🟢 Pass | | Jest log |

### 1.2 Services — `servicio.service.test.js`

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-012 | ServicioService | `listar` | Listar todos los servicios. | (ninguno) | Array de servicios | Array retornado | 🟢 Pass | | Jest log |
| UNIT-013 | ServicioService | `misServicios` | Rechazar si no hay idUsuario. | `idUsuario:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-014 | ServicioService | `misServicios` | Rechazar si no tiene permisos. | Cliente viendo servicios de otro | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-015 | ServicioService | `misServicios` | Permitir ver servicios propios. | `idUsuario == userId` | Array de servicios | Array retornado | 🟢 Pass | | Jest log |
| UNIT-016 | ServicioService | `misServicios` | Permitir a admin/técnico ver de otros. | Rol admin/técnico | Array de servicios | Array retornado | 🟢 Pass | | Jest log |
| UNIT-017 | ServicioService | `agregar` | Rechazar si faltan campos. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-018 | ServicioService | `agregar` | Rechazar si crea para otro sin permisos. | Cliente creando para otro | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-019 | ServicioService | `agregar` | Agregar si es para sí mismo. | Datos válidos propios | `servicioDao.create` invocado | create invocado | 🟢 Pass | | Jest log |
| UNIT-020 | ServicioService | `actualizar` | Rechazar si falta ID_Servicio. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-021 | ServicioService | `actualizar` | Rechazar Etapa=2 sin descripción. | `{ Etapa:2, Descripcion:"" }` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-022 | ServicioService | `actualizar` | Actualizar si datos son correctos. | Datos válidos | `servicioDao.update` invocado | update invocado | 🟢 Pass | | Jest log |
| UNIT-023 | ServicioService | `actualizar` | Rechazar si servicio no existe. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-024 | ServicioService | `cancelar` | Rechazar si no hay id. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-025 | ServicioService | `cancelar` | Rechazar si servicio no existe. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-026 | ServicioService | `cancelar` | Rechazar si está terminado o ya cancelado. | Etapa=2 o Etapa=-1 | AppError 409 | AppError 409 lanzado | 🟢 Pass | | Jest log |
| UNIT-027 | ServicioService | `cancelar` | Cancelar si todo es correcto. | Servicio activo, dueño correcto | `servicioDao.cancelar` invocado | cancelar invocado | 🟢 Pass | | Jest log |
| UNIT-028 | ServicioService | `cancelar` | Rechazar si otro usuario sin rol cancela. | Cliente cancelando de otro | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-029 | ServicioService | `eliminar` | Rechazar si falta ID. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-030 | ServicioService | `eliminar` | Eliminar correctamente. | ID válido | `servicioDao.remove` invocado | remove invocado | 🟢 Pass | | Jest log |
| UNIT-031 | ServicioService | `eliminar` | Rechazar si no se encontró. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |

### 1.3 Services — `producto.service.test.js`

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-032 | ProductoService | `listar` | Listar todos los productos. | (ninguno) | Array de productos | Array retornado | 🟢 Pass | | Jest log |
| UNIT-033 | ProductoService | `listarPublicos` | Listar productos públicos (stock>0). | (ninguno) | Array filtrado | Array retornado | 🟢 Pass | | Jest log |
| UNIT-034 | ProductoService | `agregar` | Rechazar sin campos obligatorios. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-035 | ProductoService | `agregar` | Rechazar cantidad negativa. | `Cantidad:-5` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-036 | ProductoService | `agregar` | Agregar producto correctamente. | Datos válidos | `productoDao.create` invocado | create invocado | 🟢 Pass | | Jest log |
| UNIT-037 | ProductoService | `agregar` | Rechazar producto duplicado. | Código existente | AppError 409 | AppError 409 lanzado | 🟢 Pass | | Jest log |
| UNIT-038 | ProductoService | `actualizar` | Rechazar sin código de producto. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-039 | ProductoService | `actualizar` | Actualizar si es correcto. | Datos válidos | update invocado | update invocado | 🟢 Pass | | Jest log |
| UNIT-040 | ProductoService | `actualizar` | Rechazar si no se encuentra. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-041 | ProductoService | `eliminar` | Rechazar si falta ID. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-042 | ProductoService | `eliminar` | Eliminar si es correcto. | ID válido | remove invocado | remove invocado | 🟢 Pass | | Jest log |
| UNIT-043 | ProductoService | `eliminar` | Rechazar si no encuentra. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-044 | ProductoService | `descontarStock` | Rechazar si falta ID o cantidad inválida. | `id:null, cantidad:0` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-045 | ProductoService | `descontarStock` | Rechazar si producto no existe. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-046 | ProductoService | `descontarStock` | Rechazar si stock actual es 0. | Producto con Cantidad=0 | AppError 409 | AppError 409 lanzado | 🟢 Pass | | Jest log |
| UNIT-047 | ProductoService | `descontarStock` | Rechazar si stock insuficiente. | Cantidad > stock | AppError 409 | AppError 409 lanzado | 🟢 Pass | | Jest log |
| UNIT-048 | ProductoService | `descontarStock` | Descontar correctamente. | Stock suficiente | Mensaje de éxito | Mensaje retornado | 🟢 Pass | | Jest log |
| UNIT-049 | ProductoService | `descontarStock` | Rechazar si affectedRows=0 (carrera). | Condición de carrera | AppError 409 | AppError 409 lanzado | 🟢 Pass | | Jest log |

### 1.4 Services — `comentario.service.test.js`

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-050 | ComentarioService | `listar` | Listar comentarios. | (ninguno) | Array | Array retornado | 🟢 Pass | | Jest log |
| UNIT-051 | ComentarioService | `promedio` | Calcular promedio de estrellas. | Mock DB | Objeto con promedio y distribución | Cálculo correcto | 🟢 Pass | | Jest log |
| UNIT-052 | ComentarioService | `agregar` | Rechazar sin datos. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-053 | ComentarioService | `agregar` | Rechazar por malas palabras (profanity). | Texto con groserías | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-054 | ComentarioService | `agregar` | Rechazar si cliente comenta para otro. | `ID_Usuario != userId`, rol=2 | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-055 | ComentarioService | `agregar` | Rechazar si cliente no tiene servicios activos. | 0 servicios activos | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-056 | ComentarioService | `agregar` | Agregar si todo es válido. | Datos completos válidos | Comentario creado con ID | ID retornado | 🟢 Pass | | Jest log |
| UNIT-057 | ComentarioService | `actualizar` | Rechazar si falta ID. | `Codigo_Comentario:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-058 | ComentarioService | `actualizar` | Rechazar por malas palabras al editar. | Texto ofensivo | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-059 | ComentarioService | `actualizar` | Rechazar si comentario no existe. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-060 | ComentarioService | `actualizar` | Rechazar si edita de otro sin ser admin. | Cliente editando de otro | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-061 | ComentarioService | `actualizar` | Actualizar si todo es correcto. | Datos válidos, dueño correcto | update invocado | update invocado | 🟢 Pass | | Jest log |
| UNIT-062 | ComentarioService | `eliminar` | Rechazar si no hay ID. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-063 | ComentarioService | `eliminar` | Eliminar si es admin. | Rol admin | remove invocado | remove invocado | 🟢 Pass | | Jest log |

### 1.5 Services — `pregunta.service.test.js`

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-064 | PreguntaService | `listar` | Listar todas las preguntas. | (ninguno) | Array | Array retornado | 🟢 Pass | | Jest log |
| UNIT-065 | PreguntaService | `agregar` | Rechazar si faltan datos. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-066 | PreguntaService | `agregar` | Rechazar sin userId. | `userId:null` | AppError 401 | AppError 401 lanzado | 🟢 Pass | | Jest log |
| UNIT-067 | PreguntaService | `agregar` | Rechazar si pregunta por otro siendo cliente. | `ID_Usuario != userId`, rol=2 | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-068 | PreguntaService | `agregar` | Agregar si es cliente preguntando por sí mismo. | Datos válidos propios | create invocado | create invocado | 🟢 Pass | | Jest log |
| UNIT-069 | PreguntaService | `agregar` | Agregar si es admin/técnico en nombre de otro. | Rol admin, `ID_Usuario` distinto | create invocado con ID_Usuario original | create invocado | 🟢 Pass | | Jest log |
| UNIT-070 | PreguntaService | `actualizar` | Rechazar si falta ID_Consulta. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-071 | PreguntaService | `actualizar` | Actualizar si correcto. | Datos válidos | update invocado | update invocado | 🟢 Pass | | Jest log |
| UNIT-072 | PreguntaService | `actualizar` | Rechazar si affectedRows=0. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-073 | PreguntaService | `eliminar` | Rechazar si no hay ID. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-074 | PreguntaService | `eliminar` | Eliminar correctamente. | ID válido | remove invocado | remove invocado | 🟢 Pass | | Jest log |
| UNIT-075 | PreguntaService | `eliminar` | Rechazar si no encuentra. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-076 | PreguntaService | `listarMias` | Rechazar si no hay userId. | `userId:null` | AppError 401 | AppError 401 lanzado | 🟢 Pass | | Jest log |
| UNIT-077 | PreguntaService | `listarMias` | Retornar las preguntas del usuario. | userId válido | Array filtrado | Array retornado | 🟢 Pass | | Jest log |
| UNIT-078 | PreguntaService | `responder` | Rechazar si falta ID_Consulta o Respuesta. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-079 | PreguntaService | `responder` | Responder correctamente. | Datos válidos | responder invocado | responder invocado | 🟢 Pass | | Jest log |
| UNIT-080 | PreguntaService | `responder` | Rechazar si affectedRows=0. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |

### 1.6 Services — `usuario.service.test.js`

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-081 | UsuarioService | `listar` | Retornar todos los usuarios. | (ninguno) | Array | Array retornado | 🟢 Pass | | Jest log |
| UNIT-082 | UsuarioService | `actualizar` | Rechazar sin ID_Usuario. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-083 | UsuarioService | `actualizar` | Rechazar si se quita el último admin. | Único admin, cambio de rol | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-084 | UsuarioService | `actualizar` | Procesar clave si se envía. | `Clave:"abc123"` | Hash generado | Hash generado | 🟢 Pass | | Jest log |
| UNIT-085 | UsuarioService | `actualizar` | Rechazar si clave muy corta. | `Clave:"ab"` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-086 | UsuarioService | `actualizar` | Rechazar si usuario no encontrado. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-087 | UsuarioService | `eliminar` | Rechazar si falta ID. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-088 | UsuarioService | `eliminar` | Rechazar si elimina el último admin. | Único admin | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-089 | UsuarioService | `eliminar` | Eliminar correctamente. | ID válido | remove invocado | remove invocado | 🟢 Pass | | Jest log |
| UNIT-090 | UsuarioService | `eliminar` | Rechazar si no lo encuentra. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-091 | UsuarioService | `perfilPublico` | Rechazar si no hay ID. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-092 | UsuarioService | `perfilPublico` | Rechazar si solicitante no tiene rol. | Rol no encontrado | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-093 | UsuarioService | `perfilPublico` | Rechazar si busca a otro sin ser admin. | Cliente viendo otro perfil | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-094 | UsuarioService | `perfilPublico` | Permitir ver su propio perfil. | `id == userId` | Objeto usuario | Objeto retornado | 🟢 Pass | | Jest log |
| UNIT-095 | UsuarioService | `perfilPublico` | Rechazar si usuario buscado no existe. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-096 | UsuarioService | `actualizarMiPerfil` | Rechazar si falta nombre o correo. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-097 | UsuarioService | `actualizarMiPerfil` | Actualizar mi perfil. | Datos válidos | updateMiPerfil invocado | updateMiPerfil invocado | 🟢 Pass | | Jest log |
| UNIT-098 | UsuarioService | `actualizarMiPerfil` | Rechazar si affectedRows=0. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |

### 1.7 Services — Otros servicios

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-099 | PasswordResetService | `forgotPassword` | Rechazar si no hay email. | `email:""` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-100 | PasswordResetService | `forgotPassword` | Rechazar si no existe usuario. | Email no registrado | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-101 | PasswordResetService | `forgotPassword` | Generar token y enviar correo. | Email válido | sendEmail invocado | sendEmail invocado | 🟢 Pass | | Jest log |
| UNIT-102 | PasswordResetService | `resetPassword` | Rechazar si falta token o clave. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-103 | PasswordResetService | `resetPassword` | Rechazar si formato de token inválido. | Token malformado | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-104 | PasswordResetService | `resetPassword` | Rechazar si usuario del token no existe. | Token con email inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-105 | PasswordResetService | `resetPassword` | Rechazar si firma no coincide (expirado/usado). | Token expirado | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-106 | PasswordResetService | `resetPassword` | Rechazar si contraseña muy corta. | `newPassword:"ab"` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-107 | PasswordResetService | `resetPassword` | Cambiar contraseña si todo correcto. | Token y clave válidos | updatePassword invocado | updatePassword invocado | 🟢 Pass | | Jest log |
| UNIT-108 | ChatService | `listar` | Listar todos los chats. | (ninguno) | Array | Array retornado | 🟢 Pass | | Jest log |
| UNIT-109 | ChatService | `listarMios` | Rechazar si no hay ID. | `idUsuario:null` | AppError 401 | AppError 401 lanzado | 🟢 Pass | | Jest log |
| UNIT-110 | ChatService | `listarMios` | Retornar chats únicos. | userId válido | Array sin duplicados | Array filtrado | 🟢 Pass | | Jest log |
| UNIT-111 | ChatService | `agregar` | Rechazar si falta usuario. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-112 | ChatService | `agregar` | Crear chat sin servicio (consulta). | `ID_Servicio:null` | Chat creado, `existente:false` | Chat creado | 🟢 Pass | | Jest log |
| UNIT-113 | ChatService | `agregar` | Devolver existente si servicio ya tiene chat. | Servicio con chat | `existente:true` | Existente retornado | 🟢 Pass | | Jest log |
| UNIT-114 | ChatService | `agregar` | Crear nuevo si servicio no tiene chat. | Servicio sin chat | Chat creado | Chat creado | 🟢 Pass | | Jest log |
| UNIT-115 | ChatService | `actualizar` | Rechazar si no hay ID. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-116 | ChatService | `actualizar` | Actualizar correctamente. | Datos válidos | update invocado | update invocado | 🟢 Pass | | Jest log |
| UNIT-117 | ChatService | `actualizar` | Rechazar si affectedRows=0. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-118 | ChatService | `eliminar` | Rechazar si falta id. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-119 | ChatService | `eliminar` | Eliminar correctamente. | ID válido | remove invocado | remove invocado | 🟢 Pass | | Jest log |
| UNIT-120 | ChatService | `eliminar` | Rechazar si no encuentra chat. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-121 | MensajeService | `listarPorChat` | Listar mensajes por chat. | `codigoChat:1` | Array de mensajes | Array retornado | 🟢 Pass | | Jest log |
| UNIT-122 | MensajeService | `agregar` | Rechazar sin campos obligatorios. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-123 | MensajeService | `agregar` | Agregar mensaje correctamente. | Datos válidos | Mensaje creado | Mensaje creado | 🟢 Pass | | Jest log |
| UNIT-124 | MensajeService | `actualizar` | Rechazar sin Codigo_Mensaje. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-125 | MensajeService | `actualizar` | Actualizar correctamente. | Datos válidos | update invocado | update invocado | 🟢 Pass | | Jest log |
| UNIT-126 | MensajeService | `eliminar` | Eliminar mensaje. | ID válido | remove invocado | remove invocado | 🟢 Pass | | Jest log |
| UNIT-127 | NotificacionService | `misNotificaciones` | Rechazar si falta user. | `idUsuario:null` | AppError 401 | AppError 401 lanzado | 🟢 Pass | | Jest log |
| UNIT-128 | NotificacionService | `misNotificaciones` | Devolver formateado con ISO dates. | userId válido | Array formateado | Array formateado | 🟢 Pass | | Jest log |
| UNIT-129 | NotificacionService | `contarNoLeidas` | Contar no leídas. | userId válido | `{ count, total }` | Conteo correcto | 🟢 Pass | | Jest log |
| UNIT-130 | NotificacionService | `marcarLeida` | Rechazar si falta id. | `id:null` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-131 | NotificacionService | `marcarLeida` | Rechazar si no existe. | ID inexistente | AppError 404 | AppError 404 lanzado | 🟢 Pass | | Jest log |
| UNIT-132 | NotificacionService | `marcarLeida` | Rechazar si leída por otro sin rol. | Cliente marcando de otro | AppError 403 | AppError 403 lanzado | 🟢 Pass | | Jest log |
| UNIT-133 | NotificacionService | `marcarLeida` | Marcar si es el dueño. | Dueño de la notificación | marcarLeida invocado | marcarLeida invocado | 🟢 Pass | | Jest log |
| UNIT-134 | NotificacionService | `marcarTodasLeidas` | Marcar todas. | userId válido | marcarTodasLeidas invocado | Invocado | 🟢 Pass | | Jest log |
| UNIT-135 | NotificacionAdminService | `listar` | Listar notificaciones admin. | (ninguno) | Array formateado | Array formateado | 🟢 Pass | | Jest log |
| UNIT-136 | NotificacionAdminService | `agregar` | Rechazar si no hay Mensaje. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-137 | NotificacionAdminService | `agregar` | Agregar notificación. | `{ Mensaje:"Hola" }` | create invocado | create invocado | 🟢 Pass | | Jest log |
| UNIT-138 | NotificacionAdminService | `actualizar` | Rechazar sin ID. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-139 | NotificacionAdminService | `actualizar` | Actualizar correctamente. | Datos válidos | update invocado | update invocado | 🟢 Pass | | Jest log |
| UNIT-140 | NotificacionAdminService | `eliminar` | Eliminar correctamente. | ID válido | remove invocado | remove invocado | 🟢 Pass | | Jest log |
| UNIT-141 | NotificacionAdminService | `enviar` | Rechazar si faltan datos. | `{}` | AppError 400 | AppError 400 lanzado | 🟢 Pass | | Jest log |
| UNIT-142 | NotificacionAdminService | `enviar` | Enviar notificación dirigida. | Datos completos | crearDirigida invocado | crearDirigida invocado | 🟢 Pass | | Jest log |

### 1.8 Controllers (unitarias con mocks)

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-143 | AuthController | `registro` | Responder 201 en caso de éxito. | Body válido | Status 201 | Status 201 | 🟢 Pass | | Jest log |
| UNIT-144 | AuthController | `registro` | Responder con status del error si falla. | Body inválido | Status del AppError | Status correcto | 🟢 Pass | | Jest log |
| UNIT-145 | AuthController | `login` | Responder 200 y devolver resultado. | Credenciales válidas | Status 200 + token | Status 200 + token | 🟢 Pass | | Jest log |
| UNIT-146 | AuthController | `login` | Responder error 401 si falla. | Credenciales incorrectas | Status 401 | Status 401 | 🟢 Pass | | Jest log |
| UNIT-147 | AuthController | `changePassword` | Responder 200 en caso de éxito. | Datos válidos | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-148 | AuthController (Users) | `listar` | Retornar 200 y usuarios. | (ninguno) | Status 200 + array | Status 200 | 🟢 Pass | | Jest log |
| UNIT-149 | AuthController (Users) | `listar` | Manejar error. | Error en service | Status 500 | Status 500 | 🟢 Pass | | Jest log |
| UNIT-150 | AuthController (Users) | `actualizar` | Retornar 200. | Datos válidos | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-151 | AuthController (Users) | `eliminar` | Retornar 200. | ID válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-152 | AuthController (Users) | `perfilPublico` | Retornar 200 y perfil. | ID válido | Status 200 + perfil | Status 200 | 🟢 Pass | | Jest log |
| UNIT-153 | AuthController (Users) | `actualizarMiPerfil` | Retornar 200. | Datos válidos | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-154 | AuthController (Users) | `forgotPassword` | Retornar 200. | Email válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-155 | AuthController (Users) | `resetPassword` | Retornar 200. | Token + clave | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-156 | ServicioController | `listar` | Retornar 200 y la lista. | (ninguno) | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-157 | ServicioController | `listar` | Manejar error. | Error en service | Status 500 | Status 500 | 🟢 Pass | | Jest log |
| UNIT-158 | ServicioController | `misServicios` | Retornar por params. | `req.params.id` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-159 | ServicioController | `listarMios` | Retornar servicios del userId. | `req.userId` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-160 | ServicioController | `agregar` | Crear y retornar 201. | Body válido | Status 201 | Status 201 | 🟢 Pass | | Jest log |
| UNIT-161 | ServicioController | `actualizar` | Actualizar y retornar 200. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-162 | ServicioController | `cancelar` | Cancelar y retornar 200. | ID válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-163 | ServicioController | `eliminar` | Eliminar y retornar 200. | ID válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-164 | ProductoController | `listarPublicos` | Retornar 200 y la lista. | (ninguno) | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-165 | ProductoController | `listarPublicos` | Manejar error. | Error en service | Status 500 | Status 500 | 🟢 Pass | | Jest log |
| UNIT-166 | ProductoController | `listar` | Retornar 200 y listar todos. | (ninguno) | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-167 | ProductoController | `agregar` | Crear y retornar 201. | Body válido | Status 201 | Status 201 | 🟢 Pass | | Jest log |
| UNIT-168 | ProductoController | `actualizar` | Actualizar y retornar 200. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-169 | ProductoController | `eliminar` | Eliminar y retornar 200. | ID válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-170 | ProductoController | `descontarStock` | Descontar y retornar resultado. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-171 | ChatController | `listar` | Retornar 200 y listar todos. | (ninguno) | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-172 | ChatController | `listar` | Manejar error. | Error en service | Status 500 | Status 500 | 🟢 Pass | | Jest log |
| UNIT-173 | ChatController | `listarMios` | Retornar 200. | `req.userId` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-174 | ChatController | `agregar` | Retornar 200 si existente. | Servicio con chat | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-175 | ChatController | `agregar` | Retornar 201 si nuevo. | Servicio sin chat | Status 201 | Status 201 | 🟢 Pass | | Jest log |
| UNIT-176 | ChatController | `actualizar` | Retornar 200. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-177 | ChatController | `eliminar` | Retornar 200. | ID válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-178 | MensajesController | `listarPorChat` | Retornar mensajes. | `codigoChat` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-179 | MensajesController | `agregar` | Agregar mensaje. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-180 | MensajesController | `actualizar` | Actualizar mensaje. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-181 | MensajesController | `eliminar` | Eliminar mensaje. | ID válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-182 | NotificacionController | `misNotificaciones` | Retornar 200. | `req.userId` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-183 | NotificacionController | `contarNoLeidas` | Retornar 200. | `req.userId` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-184 | NotificacionController | `marcarLeida` | Retornar 200. | `req.params.id` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-185 | NotificacionController | `marcarTodasLeidas` | Retornar 200. | `req.userId` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-186 | ComentarioController | `listar` | Retornar 200. | (ninguno) | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-187 | ComentarioController | `promedio` | Retornar 200. | (ninguno) | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-188 | ComentarioController | `agregar` | Retornar 201. | Body válido | Status 201 | Status 201 | 🟢 Pass | | Jest log |
| UNIT-189 | ComentarioController | `actualizar` | Retornar 200. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-190 | ComentarioController | `eliminar` | Retornar 200. | ID válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-191 | PreguntaController | `listar` | Retornar 200 y la lista. | (ninguno) | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-192 | PreguntaController | `listar` | Manejar error. | Error en service | Status 500 | Status 500 | 🟢 Pass | | Jest log |
| UNIT-193 | PreguntaController | `listarMias` | Retornar 200. | `req.userId` | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-194 | PreguntaController | `agregar` | Retornar 201. | Body válido | Status 201 | Status 201 | 🟢 Pass | | Jest log |
| UNIT-195 | PreguntaController | `actualizar` | Retornar 200. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-196 | PreguntaController | `eliminar` | Retornar 200. | ID válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |
| UNIT-197 | PreguntaController | `responder` | Retornar 200. | Body válido | Status 200 | Status 200 | 🟢 Pass | | Jest log |

### 1.9 DAOs (unitarias con mocks de DB)

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-198 | UsuarioDAO | `getAll` | Retornar todos. | (ninguno) | Array | Array retornado | 🟢 Pass | | Jest log |
| UNIT-199 | UsuarioDAO | `findByEmail` | Buscar por email. | Email válido | Array con resultado | Array retornado | 🟢 Pass | | Jest log |
| UNIT-200 | UsuarioDAO | `findById` | Buscar por ID. | ID válido | Array con resultado | Array retornado | 🟢 Pass | | Jest log |
| UNIT-201 | UsuarioDAO | `create` | Crear usuario. | Datos válidos | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-202 | UsuarioDAO | `update` | Actualizar usuario. | Datos válidos | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-203 | UsuarioDAO | `updateMiPerfil` | Actualizar perfil propio. | Datos válidos | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-204 | UsuarioDAO | `remove` | Eliminar usuario. | ID válido | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-205 | UsuarioDAO | `updatePassword` | Actualizar contraseña. | Hash nuevo | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-206 | UsuarioDAO | `getRol` | Retornar rol. | ID válido | Codigo_Rol | Rol retornado | 🟢 Pass | | Jest log |
| UNIT-207 | UsuarioDAO | `countAdmins` | Contar admins. | (ninguno) | Número | Número retornado | 🟢 Pass | | Jest log |
| UNIT-208 | UsuarioDAO | `getAll` | Manejar error de DB. | Error simulado | Excepción lanzada | Excepción lanzada | 🟢 Pass | | Jest log |
| UNIT-209 | ProductoDAO | `getAll` | Retornar todos. | (ninguno) | Array | Array retornado | 🟢 Pass | | Jest log |
| UNIT-210 | ProductoDAO | `findById` | Buscar por ID. | ID válido | Array con resultado | Array retornado | 🟢 Pass | | Jest log |
| UNIT-211 | ProductoDAO | `create` | Crear producto. | Datos válidos | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-212 | ProductoDAO | `update` | Actualizar producto. | Datos válidos | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-213 | ProductoDAO | `remove` | Eliminar producto. | ID válido | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-214 | ProductoDAO | `actualizarStock` | Actualizar stock. | Código y cantidad | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-215 | ServicioDAO | `getAll` | Retornar todos. | (ninguno) | Array | Array retornado | 🟢 Pass | | Jest log |
| UNIT-216 | ServicioDAO | `findById` | Buscar por ID. | ID válido | Array con resultado | Array retornado | 🟢 Pass | | Jest log |
| UNIT-217 | ServicioDAO | `getByUsuario` | Buscar por usuario. | ID usuario | Array filtrado | Array retornado | 🟢 Pass | | Jest log |
| UNIT-218 | ServicioDAO | `getActivosByUsuario` | Buscar activos por usuario. | ID usuario | Array filtrado | Array retornado | 🟢 Pass | | Jest log |
| UNIT-219 | ServicioDAO | `create` | Crear servicio. | Datos válidos | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-220 | ServicioDAO | `update` | Actualizar servicio. | Datos válidos | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |
| UNIT-221 | ServicioDAO | `remove` | Eliminar servicio. | ID válido | Query ejecutado | Query ejecutado | 🟢 Pass | | Jest log |

### 1.10 Health Check

| ID Prueba | Módulo/Componente | Función/Método | Descripción | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-222 | Health API | `GET /health` | Retornar status ok y timestamp. | GET request | `{ status:"ok", timestamp }` | Status ok retornado | 🟢 Pass | Supertest | Jest log |

---

## 2. Pruebas de Integración (con Base de Datos real)

Se han ejecutado un total de **33 pruebas de integración** utilizando `supertest` y conectando el backend directamente a la base de datos MySQL real. Estas pruebas cubren todos los módulos (Auth, Productos, Servicios, Notificaciones, Usuarios, Chat, Mensajes, Comentarios y Categorías) asegurando que los controladores se integren correctamente con el DAO y la base de datos (con limpieza de DB pre/post test).

#### 🟢 **Estado:** 33 / 33 Pass

| Módulo | Escenarios Verificados (Ejemplos Principales) | Tiempo Prom. | Resultado |
|---|---|---|---|
| **Auth** | Registro en DB real, Rechazo duplicado, Login con generación de JWT. | ~80ms | 🟢 Pass (3) |
| **Servicios** | Rechazo sin token (401), Listar servicios asignados mapeados desde DB. | ~20ms | 🟢 Pass (2) |
| **Productos** | CRUD completo, listar catálogo (solo con stock), validación de `Activo_Catalogo` y `descontarStock` evitando stock negativo. | ~20ms | 🟢 Pass (5) |
| **Chat & Mensajes** | Creación de chats, filtros de contenido (malas palabras, URLs), inserción en tablas relacionales (`Chat` y `Mensajes`). | ~25ms | 🟢 Pass (6) |
| **Notificaciones** | Envío dirigido (Admin → Cliente), Listar mis notificaciones, Conteo `Badge` de no leídas, Marcar leída, Prevención de acceso cruzado. | ~15ms | 🟢 Pass (5) |
| **Comentarios** | Cliente con servicio activo (Etapa=2) puede comentar, middleware bloquea insultos, cálculo de promedios. | ~30ms | 🟢 Pass (3) |
| **Categorías** | CRUD por Admin, acceso a listado público. Manejo de duplicados y dependencias en tabla `Categoria`. | ~20ms | 🟢 Pass (5) |
| **Usuarios** | Listar por Admin, edición del propio perfil por cliente, control estricto de roles. | ~15ms | 🟢 Pass (4) |

> [!NOTE]
> *¿Fueron suficientes las pruebas iniciales?* No. Al inicio solo se evaluaban Auth y Servicios. Se implementaron las pruebas adicionales restantes en 7 módulos, garantizando la cobertura de los middlewares de autorización y el filtrado de contenido en la persistencia real.

---

## 3. Pruebas End-to-End (E2E) — WebdriverIO

| Id Prueba | Escenario / Flujo de Usuario | Pasos de Ejecución | Datos de Prueba | Resultado Esperado | Resultado Obtenido | Estado | Observaciones | Evidencia (Video/Screenshot) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| E2E-001 | Login y autenticación (`auth.spec.js`) | 1. Abrir login.<br>2. Ingresar credenciales válidas.<br>3. Verificar redirección al panel. | Credenciales de prueba | Login exitoso, JWT en localStorage, panel visible | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-002 | Registro de usuario (`registro.spec.js`) | 1. Navegar a registro.<br>2. Llenar formulario.<br>3. Enviar.<br>4. Verificar redirección a login. | Datos de nuevo usuario | Registro exitoso, redirección, login funcional | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-003 | Catálogo público (`catalogo.spec.js`) | 1. Entrar a home.<br>2. Ver catálogo.<br>3. Filtrar productos.<br>4. Usar paginación. | Productos existentes | Catálogo carga, filtros funcionan, paginación funciona | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-004 | Gestión de categorías (`categorias.spec.js`) | 1. Login como admin/técnico.<br>2. Ir a categorías.<br>3. Crear, editar, eliminar. | Credenciales admin | CRUD completo funcional | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-005 | Chat en tiempo real (`chat.spec.js`) | 1. Login.<br>2. Abrir chat.<br>3. Enviar mensaje.<br>4. Verificar envío. | Sesión activa | Mensajes enviados y visibles | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-006 | Comentarios y reseñas (`comentarios.spec.js`) | 1. Login como cliente.<br>2. Navegar a comentarios.<br>3. Publicar reseña con estrellas.<br>4. Verificar en lista. | Cliente con servicio activo | Comentario publicado, estrellas visibles | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-007 | Gestión de servicios (`servicios.spec.js`) | 1. Login.<br>2. Ver mis servicios.<br>3. Crear servicio.<br>4. Verificar estado. | Credenciales válidas | Servicio creado y visible en lista | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-008 | Gestión de productos (`productos.spec.js`) | 1. Login como admin/técnico.<br>2. Ir a productos.<br>3. Crear, editar, eliminar producto. | Credenciales admin | CRUD de productos funcional | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-009 | Preguntas del catálogo (`preguntas.spec.js`) | 1. Login como cliente.<br>2. Hacer pregunta sobre producto.<br>3. Login como técnico.<br>4. Responder pregunta. | Producto existente | Pregunta creada, respuesta visible | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-010 | Notificaciones (`notificaciones.spec.js`) | 1. Login.<br>2. Ver notificaciones.<br>3. Marcar como leída.<br>4. Verificar conteo. | Notificaciones existentes | Badge actualizado, leídas marcadas | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-011 | Historial de servicios (`historial.spec.js`) | 1. Login como admin/técnico.<br>2. Ver historial de un servicio.<br>3. Verificar eventos registrados. | Servicio con historial | Eventos visibles cronológicamente | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-012 | Perfil de usuario (`perfil.spec.js`) | 1. Login.<br>2. Ir a mi perfil.<br>3. Editar datos.<br>4. Guardar cambios. | Datos nuevos de perfil | Perfil actualizado correctamente | | ⚪ Pending | Requiere navegador + servidores activos | |
| E2E-013 | Panel de administración (`admin.spec.js`) | 1. Login como admin.<br>2. Gestionar usuarios.<br>3. Cambiar roles.<br>4. Gestionar tipos de documento. | Credenciales admin | CRUD de usuarios y roles funcional | | ⚪ Pending | Requiere navegador + servidores activos | |
