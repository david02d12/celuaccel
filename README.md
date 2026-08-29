# CeluAccel 

Sistema de gestión de servicios técnicos para reparación de dispositivos móviles. Permite a clientes solicitar servicios, seguir el estado de su reparación en tiempo real y comunicarse con los técnicos a través de un chat integrado.

---

##  Tabla de contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [Pruebas E2E](#pruebas-e2e)
- [Roles del sistema](#roles-del-sistema)
- [Estructura del proyecto](#estructura-del-proyecto)
- [API](#api)

---

## Descripción

CeluAccel es una plataforma web full-stack que conecta a clientes con técnicos de reparación de celulares. Incluye:

- Catálogo público de productos y servicios
- Registro y autenticación de usuarios con JWT
- Seguimiento de servicios técnicos por etapas
- Chat en tiempo real entre cliente y técnico (Socket.IO)
- Sistema de notificaciones
- Preguntas y respuestas
- Reseñas y comentarios
- Panel de administración

---

## Tecnologías

### Backend
| Herramienta | Uso |
|---|---|
| Node.js + Express 5 | Servidor REST |
| MySQL2 | Base de datos relacional |
| Socket.IO | Chat en tiempo real |
| JWT (jsonwebtoken) | Autenticación |
| bcrypt | Hash de contraseñas |
| Helmet | Seguridad de headers HTTP |
| express-rate-limit | Protección contra fuerza bruta |
| Multer | Subida de archivos |
| Nodemailer | Envío de correos |
| Swagger UI | Documentación de la API |

### Frontend
| Herramienta | Uso |
|---|---|
| React 18 + Vite | SPA del cliente |
| Bootstrap 5 | Estilos y componentes |
| Axios | Llamadas HTTP |
| Socket.IO Client | Chat en tiempo real |

### Testing
| Herramienta | Uso |
|---|---|
| WebdriverIO | Pruebas E2E |
| Mocha | Framework de tests |
| ChromeDriver | Navegador de pruebas |

---

## Arquitectura

```
celuaccel/
├── backend/          # API REST + Socket.IO
│   ├── routes/       # Definición de endpoints
│   ├── controllers/  # Lógica de peticiones HTTP
│   ├── services/     # Lógica de negocio
│   ├── dao/          # Acceso a base de datos
│   ├── middlewares/  # Auth, upload, filtros
│   └── config/       # DB, Socket, AppError
├── frontend/         # Aplicación React
│   ├── src/
│   │   ├── components/   # Vistas por rol (admin/, tecnico/, usuario/)
│   │   ├── hooks/        # Lógica reutilizable
│   │   ├── services/     # Instancia axios centralizada
│   │   ├── utils/        # Validaciones compartidas
│   │   └── context/      # Tema claro/oscuro
│   └── tests/            # Pruebas E2E con WDIO
└── movil/            # Aplicación móvil
```

---

## Requisitos previos

- **Node.js** ≥ 18
- **MySQL** ≥ 8
- **Google Chrome** (para las pruebas E2E)
- **npm** ≥ 9

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd celuaccel
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

---

## Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` con tus datos reales. Ver [`backend/.env.example`](./backend/.env.example) para la lista completa de variables requeridas.

>  **Nunca subas el archivo `.env` al repositorio.**

---

## Ejecución

### Backend

```bash
cd backend
npm start          # Producción
npm run dev        # Desarrollo con recarga automática (nodemon)
```

- API REST: `http://localhost:3000/api`
- Documentación Swagger: `http://localhost:3000/doc`
- Health check: `http://localhost:3000/api/health`

### Frontend

```bash
cd frontend
npm run dev
```

- Aplicación: `http://localhost:5173`

---

## Pruebas E2E

Las pruebas requieren que **ambos servidores estén corriendo** antes de ejecutarlas.

```bash
# Terminal 1 — backend
cd backend && npm start

# Terminal 2 — frontend
cd frontend && npm run dev

# Terminal 3 — pruebas
cd frontend
npx wdio run wdio.config.js
```

### Ejecutar un módulo específico

```bash
npx wdio run wdio.config.js --spec tests/auth.spec.js
```

### Módulos de prueba disponibles

| Archivo | Módulo | Roles cubiertos |
|---|---|---|
| `auth.spec.js` | Login y navegación | Todos |
| `registro.spec.js` | Registro de usuario | Público |
| `catalogo.spec.js` | Catálogo de productos | Público / Usuario |
| `servicios.spec.js` | Gestión de servicios | Usuario / Técnico |
| `chat.spec.js` | Chat en tiempo real | Usuario / Técnico |
| `preguntas.spec.js` | Preguntas y respuestas | Usuario / Técnico |
| `comentarios.spec.js` | Reseñas | Usuario |
| `notificaciones.spec.js` | Notificaciones | Usuario / Técnico |
| `admin.spec.js` | Panel administrativo | Admin |

---

## Roles del sistema

| Código | Nombre | Acceso |
|---|---|---|
| `1` | Técnico | Servicios, historial, chat, productos, categorías, preguntas, notificaciones |
| `2` | Cliente | Mis servicios, catálogo, chat con asesor, comentarios, mis preguntas, notificaciones |
| `3` | Administrador | Todo lo anterior + gestión de usuarios, roles y tipos de documento |

---

## Estructura del proyecto

```
backend/
├── server.js                  # Punto de entrada
├── swagger.json               # Documentación OpenAPI
├── .env.example               # Plantilla de variables de entorno
├── config/
│   ├── db.js                  # Pool de conexiones MySQL
│   ├── AppError.js            # Clase de errores tipados con código HTTP
│   ├── profanity.js           # Filtro de contenido inapropiado
│   └── socket.handler.js      # Eventos de Socket.IO (chat en tiempo real)
├── middlewares/
│   ├── authMiddleware.js      # Validación de JWT y control de roles
│   ├── filtrarContenido.js    # Filtro de lenguaje en mensajes y comentarios
│   └── upload.middleware.js   # Subida de archivos con Multer
├── routes/                    # Rutas REST de la API
├── controllers/               # Controladores HTTP
├── services/                  # Lógica de negocio
└── dao/                       # Consultas a la base de datos

frontend/src/
├── App.jsx                    # Router principal por vista y rol
├── components/
│   ├── admin/                 # Usuarios, Roles, Tipo de Documento
│   ├── tecnico/               # Servicios, Chats, Productos, Historial, etc.
│   ├── usuario/               # MiServicio, ChatVista, Comentarios, Perfil, etc.
│   └── publico/               # CatalogoPublico (sin login)
├── hooks/
│   ├── useSessionGuard.js     # Manejo de sesión y expiración automática
│   ├── useCustomRouter.js     # Navegación por vistas sin React Router
│   └── useRegistroForm.js     # Formulario de registro con validaciones
├── services/api.js            # Axios centralizado con interceptor JWT
├── utils/validaciones.js      # Funciones de validación compartidas
└── context/ThemeContext.jsx   # Sistema de tema claro / oscuro
```

---

## API

La documentación interactiva de la API está disponible en Swagger:

```
http://localhost:3000/doc
```

### Endpoints principales

| Método | Endpoint | Descripción | Auth requerida |
|---|---|---|---|
| `POST` | `/api/login` | Autenticación | No |
| `POST` | `/api/registro` | Registro de usuario | No |
| `POST` | `/api/forgot-password` | Solicitar recuperación de contraseña | No |
| `POST` | `/api/reset-password/:token` | Restablecer contraseña con token | No |
| `GET` | `/api/servicios/listar` | Listar todos los servicios | Técnico / Admin |
| `GET` | `/api/servicios/mis-servicios/:id` | Servicios de un cliente | Usuario |
| `GET` | `/api/productos/listar` | Catálogo de productos | Todos |
| `GET` | `/api/health` | Estado del servidor | No |

---

## Autor

Proyecto desarrollado por el equipo de CeluAccel.
