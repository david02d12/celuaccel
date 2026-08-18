# CeluAccel

Sistema web para gestión de servicios técnicos de celulares. Clientes pueden pedir reparaciones, ver el estado en tiempo real y chatear con el técnico. Los técnicos gestionan los servicios desde su panel. El admin controla usuarios, roles y configuración.

---

## Tabla de contenidos

- [Tecnologías usadas](#tecnologías-usadas)
- [Requisitos](#requisitos)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Pruebas](#pruebas)
- [Roles](#roles)
- [Estructura](#estructura)

---

## Tecnologías usadas

**Backend:** Node.js, Express 5, MySQL2, Socket.IO, JWT, bcrypt, Helmet, Multer, Nodemailer, Swagger  
**Frontend:** React 18, Vite, Bootstrap 5, Axios, Socket.IO Client  
**Testing:** WebdriverIO, Mocha, ChromeDriver

---

## Requisitos

- Node.js >= 18
- MySQL >= 8
- Google Chrome instalado (para las pruebas)

---

## Cómo correr el proyecto

### Backend

```bash
cd backend
npm install
npm run dev
```

Corre en `http://localhost:3000`  
Documentación de la API: `http://localhost:3000/doc`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173`

---

## Variables de entorno

Crear el archivo `backend/.env` basándose en `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Llenar los valores reales (base de datos, JWT secret, correo, etc.).  
**El `.env` nunca se sube al repositorio.**

---

## Pruebas

Se necesita tener el backend y el frontend corriendo antes de lanzar las pruebas.

```bash
cd frontend
npx wdio run wdio.config.js
```

Para correr solo un módulo:

```bash
npx wdio run wdio.config.js --spec tests/auth.spec.js
```

| Archivo | Qué prueba |
|---|---|
| `auth.spec.js` | Login, logout, navegación |
| `registro.spec.js` | Registro de usuarios y validaciones |
| `catalogo.spec.js` | Catálogo público y autenticado |
| `servicios.spec.js` | Solicitud y gestión de servicios |
| `chat.spec.js` | Chat en tiempo real |
| `preguntas.spec.js` | Preguntas y respuestas |
| `comentarios.spec.js` | Reseñas de productos |
| `notificaciones.spec.js` | Notificaciones push |
| `admin.spec.js` | Panel de administración |

---

## Roles

| Rol | Código | Qué puede hacer |
|---|---|---|
| Técnico | 1 | Ver y gestionar servicios, chat, productos, categorías, historial |
| Cliente | 2 | Pedir servicios, chat, comentarios, preguntas, notificaciones |
| Administrador | 3 | Todo lo anterior más gestión de usuarios y configuración |

---

## Estructura

```
celuaccel/
├── backend/
│   ├── server.js              # Entrada del servidor
│   ├── routes/                # Endpoints de la API
│   ├── controllers/           # Lógica de cada ruta
│   ├── services/              # Reglas de negocio
│   ├── dao/                   # Consultas a la base de datos
│   ├── middlewares/           # Auth JWT, subida de archivos, filtros
│   └── config/                # DB, Socket.IO, errores
├── frontend/
│   ├── src/
│   │   ├── components/        # Vistas separadas por rol (admin, tecnico, usuario)
│   │   ├── hooks/             # Lógica de formularios y sesión
│   │   ├── services/api.js    # Axios con token automático
│   │   ├── utils/             # Validaciones reutilizables
│   │   └── context/           # Tema claro/oscuro
│   └── tests/                 # Pruebas E2E con WebdriverIO
└── movil/                     # App móvil
```
