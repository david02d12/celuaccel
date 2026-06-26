# Base de Datos - CeluAccel

## Tecnologia
- **Motor**: MySQL / MariaDB
- **Conexion**: Pool de conexiones via `mysql2`

## Archivos

| Archivo | Descripcion |
|---------|------------|
| `db.js` | Configuracion del pool de conexiones |
| `db_migrations.js` | Script de creacion/migracion de tablas |
| `.env.example` | Variables de entorno necesarias |

## Variables de entorno requeridas
Copia `.env.example` a `.env` y configura:
- `DB_HOST` - Host de la base de datos
- `DB_USER` - Usuario MySQL
- `DB_PASSWORD` - Contrasena MySQL
- `DB_NAME` - Nombre de la base de datos
- `DB_PORT` - Puerto (default: 3306)

## Ejecutar migraciones
```bash
node db_migrations.js
```
