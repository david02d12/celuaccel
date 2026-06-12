-- ============================================================
-- BASE DE DATOS: CeluAccel
-- Versión mejorada con:
--   · CHARACTER SET utf8mb4 (soporte tildes y emojis)
--   · Tipos de dato corregidos y ajustados a la lógica real
--   · Columna Imagen ampliada a VARCHAR(255) (rutas reales)
--   · Descripcion ampliada a VARCHAR(500) donde corresponde
--   · Columna Activo_Catalogo → TINYINT(1) (booleano real)
--   · Columna Etapa con ENUM o rango documentado (-1, 0..100)
--   · Notificaciones: columna separada para el destinatario (no JSON inline)
--   · Historial_Servicios: Estado como TINYINT, Descripcion ampliada
--   · Mensajes: Fecha_Mensaje → DATETIME (hora exacta)
--   · Pregunta: Respuesta añadida + ID del técnico que responde
--   · Producto: columna Precio_Compra (costo) para control de margen
--   · Índices adicionales en columnas de búsqueda frecuente
--   · Safe-drop al inicio para poder re-ejecutar limpiamente
--   · Datos de prueba ordenados y corregidos (categoría PRO005 = USB)
-- ============================================================

-- ── Seguridad: evitar errores si ya existe ──────────────────
DROP DATABASE IF EXISTS celuaccel;
CREATE DATABASE celuaccel
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE celuaccel;

-- ── Desactivar FK checks durante la creación ────────────────
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLAS DE CATÁLOGO / MAESTRAS
-- (sin FK salientes, se crean primero)
-- ============================================================

-- ── Roles ────────────────────────────────────────────────────
CREATE TABLE Roles (
    Codigo_Rol       TINYINT UNSIGNED NOT NULL,
    Descripcion_Rol  VARCHAR(50)      NOT NULL,
    PRIMARY KEY (Codigo_Rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tipo de Documento ────────────────────────────────────────
CREATE TABLE Tipo_Documento (
    Codigo_Documento  TINYINT UNSIGNED NOT NULL,
    Nombre_Documento  VARCHAR(60)      NOT NULL,
    PRIMARY KEY (Codigo_Documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Categoría ────────────────────────────────────────────────
CREATE TABLE Categoria (
    ID_Categoria     SMALLINT UNSIGNED NOT NULL,
    Nombre_Categoria VARCHAR(80)       NOT NULL,
    PRIMARY KEY (ID_Categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ENTIDADES PRINCIPALES
-- ============================================================

-- ── Usuario ──────────────────────────────────────────────────
-- ID_Usuario: cédula/documento como texto (puede tener letras → B5465312)
-- Correo: ampliado a 100 para correos largos; UNIQUE para no duplicar
CREATE TABLE Usuario (
    ID_Usuario        VARCHAR(50)  NOT NULL,
    Codigo_Documento  TINYINT UNSIGNED NOT NULL,
    Nombre            VARCHAR(120) NOT NULL,
    Fecha_Nacimiento  DATE         NOT NULL,
    Direccion         VARCHAR(150) NOT NULL,
    Telefono          VARCHAR(20)  NOT NULL,
    Correo            VARCHAR(100) NOT NULL,
    Contraseña        VARCHAR(255) NOT NULL,              -- bcrypt hash = 60 chars, espacio para futuro
    Codigo_Rol        TINYINT UNSIGNED NOT NULL DEFAULT 2,
    Fecha_Registro    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Usuario),
    UNIQUE  KEY uq_usuario_correo (Correo),
    INDEX   idx_usuario_rol  (Codigo_Rol),
    CONSTRAINT fk_usuario_rol  FOREIGN KEY (Codigo_Rol)
        REFERENCES Roles (Codigo_Rol) ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_tdoc FOREIGN KEY (Codigo_Documento)
        REFERENCES Tipo_Documento (Codigo_Documento) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Producto ─────────────────────────────────────────────────
-- Imagen: VARCHAR(255) para rutas/URLs reales
-- Descripcion: VARCHAR(500) (50 caracteres era demasiado corto)
-- Activo_Catalogo: TINYINT(1) → booleano real (0 o 1)
-- Precio_Compra: costo de adquisición para control de margen
CREATE TABLE Producto (
    Codigo_Producto  VARCHAR(20)        NOT NULL,
    Nombre           VARCHAR(120)       NOT NULL,
    Descripcion      VARCHAR(500)       NOT NULL,
    Cantidad         INT    UNSIGNED    NOT NULL DEFAULT 0,
    Precio           DECIMAL(12,2)      NOT NULL,          -- DECIMAL evita imprecisiones de punto flotante
    Precio_Compra    DECIMAL(12,2)               DEFAULT NULL,  -- costo (opcional)
    Imagen           VARCHAR(255)       NOT NULL DEFAULT '',
    Activo_Catalogo  TINYINT(1)         NOT NULL DEFAULT 1,
    ID_Categoria     SMALLINT UNSIGNED  NOT NULL,
    PRIMARY KEY (Codigo_Producto),
    INDEX idx_producto_categoria (ID_Categoria),
    INDEX idx_producto_activo    (Activo_Catalogo),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (ID_Categoria)
        REFERENCES Categoria (ID_Categoria) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Servicio ─────────────────────────────────────────────────
-- Descripcion ampliada a VARCHAR(500)
-- Movil_Especificacion ampliada a VARCHAR(500)
-- Etapa: INT SIGNED → permite -1 (cancelado), 0-100 (progreso), 100 (completado)
-- Precio: DECIMAL para evitar errores de punto flotante
-- Fecha_Creacion: timestamp automático de registro
CREATE TABLE Servicio (
    ID_Servicio          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    Descripcion          VARCHAR(500)  NOT NULL,
    ID_Usuario           VARCHAR(50)   NOT NULL,
    Precio               DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    Movil_Nombre         VARCHAR(100)  NOT NULL,
    Movil_Especificacion VARCHAR(500)  NOT NULL,
    Fecha                DATE          NOT NULL,
    Etapa                SMALLINT      NOT NULL DEFAULT 0,  -- -1=cancelado, 0=recibido, 50=en proceso, 100=completado
    Fecha_Creacion       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Servicio),
    INDEX idx_servicio_usuario (ID_Usuario),
    INDEX idx_servicio_etapa   (Etapa),
    CONSTRAINT fk_servicio_usuario FOREIGN KEY (ID_Usuario)
        REFERENCES Usuario (ID_Usuario) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Chat ─────────────────────────────────────────────────────
-- Un chat puede estar asociado a un servicio (nullable)
-- o ser un chat de consulta de catálogo (ID_Servicio NULL)
CREATE TABLE Chat (
    Codigo_Chat  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ID_Usuario   VARCHAR(50)  NOT NULL,
    ID_Servicio  INT UNSIGNED          DEFAULT NULL,
    Fecha_Inicio DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Codigo_Chat),
    INDEX idx_chat_usuario  (ID_Usuario),
    INDEX idx_chat_servicio (ID_Servicio),
    CONSTRAINT fk_chat_usuario  FOREIGN KEY (ID_Usuario)
        REFERENCES Usuario (ID_Usuario) ON UPDATE CASCADE,
    CONSTRAINT fk_chat_servicio FOREIGN KEY (ID_Servicio)
        REFERENCES Servicio (ID_Servicio) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Mensajes ─────────────────────────────────────────────────
-- Fecha_Mensaje → DATETIME (la hora exacta del mensaje es importante en un chat)
-- Estado: TINYINT(1) → 0=no leído, 1=leído (booleano real)
CREATE TABLE Mensajes (
    Codigo_Mensaje  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    Codigo_Chat     INT UNSIGNED NOT NULL,
    ID_Usuario      VARCHAR(50)  NOT NULL,
    Fecha_Mensaje   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Mensaje         VARCHAR(1000) NOT NULL,               -- ampliado: 500 era corto para conversaciones
    Estado          TINYINT(1)   NOT NULL DEFAULT 0,      -- 0=no leído, 1=leído
    PRIMARY KEY (Codigo_Mensaje),
    INDEX idx_mensaje_chat    (Codigo_Chat),
    INDEX idx_mensaje_usuario (ID_Usuario),
    CONSTRAINT fk_mensaje_chat    FOREIGN KEY (Codigo_Chat)
        REFERENCES Chat (Codigo_Chat) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mensaje_usuario FOREIGN KEY (ID_Usuario)
        REFERENCES Usuario (ID_Usuario) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Comentarios ──────────────────────────────────────────────
-- Estrellas: TINYINT con CHECK (1-5)
-- Fecha_Comentario → DATETIME
CREATE TABLE Comentarios (
    Codigo_Comentario  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ID_Usuario         VARCHAR(50)  NOT NULL,
    Comentario         VARCHAR(1000) NOT NULL,
    Fecha_Comentario   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Estrellas          TINYINT      NOT NULL DEFAULT 5,
    PRIMARY KEY (Codigo_Comentario),
    CONSTRAINT chk_estrellas CHECK (Estrellas BETWEEN 1 AND 5),
    INDEX idx_comentario_usuario (ID_Usuario),
    CONSTRAINT fk_comentario_usuario FOREIGN KEY (ID_Usuario)
        REFERENCES Usuario (ID_Usuario) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Notificaciones ───────────────────────────────────────────
-- MEJORA ARQUITECTURAL:
--   El diseño original guarda un JSON completo en Tipo_Notificacion,
--   incluyendo el destinatario dentro del texto. Esto dificulta filtrar
--   y genera dependencia de parseo en la capa de servicio.
--   Se añaden columnas explícitas para destinatario, remitente y servicio
--   manteniendo el campo Tipo_Notificacion para el texto/payload adicional.
CREATE TABLE Notificaciones (
    Codigo_Notificaciones  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ID_Usuario_Destino     VARCHAR(50)           DEFAULT NULL,  -- NULL = notificación global/plantilla
    ID_Usuario_Origen      VARCHAR(50)           DEFAULT NULL,  -- quién la genera
    ID_Servicio            INT UNSIGNED          DEFAULT NULL,  -- servicio relacionado (opcional)
    Tipo_Notificacion      VARCHAR(1000) NOT NULL,
    Leida                  TINYINT(1)    NOT NULL DEFAULT 0,
    Fecha_Notificacion     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Codigo_Notificaciones),
    INDEX idx_noti_destino  (ID_Usuario_Destino),
    INDEX idx_noti_leida    (ID_Usuario_Destino, Leida),
    INDEX idx_noti_servicio (ID_Servicio),
    CONSTRAINT fk_noti_destino  FOREIGN KEY (ID_Usuario_Destino)
        REFERENCES Usuario (ID_Usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_noti_origen   FOREIGN KEY (ID_Usuario_Origen)
        REFERENCES Usuario (ID_Usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_noti_servicio FOREIGN KEY (ID_Servicio)
        REFERENCES Servicio (ID_Servicio) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Pregunta (consultas sobre productos) ────────────────────
-- Se añade: Respuesta + ID_Tecnico_Responde + Fecha_Respuesta
-- para cerrar el ciclo de Q&A sin necesidad de una tabla extra
CREATE TABLE Pregunta (
    ID_Consulta         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ID_Usuario          VARCHAR(50)  NOT NULL,
    Codigo_Producto     VARCHAR(20)  NOT NULL,
    Pregunta            VARCHAR(1000) NOT NULL,
    Fecha               DATE         NOT NULL DEFAULT (CURRENT_DATE),
    Respuesta           VARCHAR(1000)          DEFAULT NULL,
    ID_Tecnico_Responde VARCHAR(50)            DEFAULT NULL,
    Fecha_Respuesta     DATETIME               DEFAULT NULL,
    PRIMARY KEY (ID_Consulta),
    INDEX idx_pregunta_usuario   (ID_Usuario),
    INDEX idx_pregunta_producto  (Codigo_Producto),
    CONSTRAINT fk_pregunta_usuario  FOREIGN KEY (ID_Usuario)
        REFERENCES Usuario (ID_Usuario) ON UPDATE CASCADE,
    CONSTRAINT fk_pregunta_producto FOREIGN KEY (Codigo_Producto)
        REFERENCES Producto (Codigo_Producto) ON UPDATE CASCADE,
    CONSTRAINT fk_pregunta_tecnico  FOREIGN KEY (ID_Tecnico_Responde)
        REFERENCES Usuario (ID_Usuario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Historial de Servicios ───────────────────────────────────
-- Descripcion_Evento ampliada a VARCHAR(500)
-- Estado: TINYINT(1) → 0=pendiente, 1=completado (coherente con el DAO)
-- Se añade: Etapa_Registro para registrar qué etapa tenía el servicio en ese momento
CREATE TABLE Historial_Servicios (
    ID_Historial        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    ID_Servicio         INT UNSIGNED  NOT NULL,
    Fecha_Evento        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Descripcion_Evento  VARCHAR(500)  NOT NULL,
    Estado              TINYINT(1)    NOT NULL DEFAULT 1, -- 0=pendiente, 1=resuelto/completado
    Etapa_Registro      SMALLINT               DEFAULT NULL, -- etapa del servicio al momento del evento
    PRIMARY KEY (ID_Historial),
    INDEX idx_historial_servicio (ID_Servicio),
    CONSTRAINT fk_historial_servicio FOREIGN KEY (ID_Servicio)
        REFERENCES Servicio (ID_Servicio) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Reactivar FK checks ──────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DATOS MAESTROS / CATÁLOGO
-- ============================================================

-- ── Roles ────────────────────────────────────────────────────
INSERT INTO Roles (Codigo_Rol, Descripcion_Rol) VALUES
    (1, 'Tecnico'),
    (2, 'Cliente'),
    (3, 'Administrador');

-- ── Tipos de Documento ───────────────────────────────────────
INSERT INTO Tipo_Documento (Codigo_Documento, Nombre_Documento) VALUES
    (1, 'Cédula de Ciudadanía'),
    (2, 'Tarjeta de Identidad'),
    (3, 'Cédula de Extranjería'),
    (4, 'Pasaporte'),
    (5, 'Permiso Especial de Permanencia (PEP)');

-- ── Categorías ───────────────────────────────────────────────
INSERT INTO Categoria (ID_Categoria, Nombre_Categoria) VALUES
    ( 1, 'Audífonos'),
    ( 2, 'Cargadores'),
    ( 3, 'Forros'),
    ( 4, 'Accesorios'),
    ( 5, 'Otros'),
    ( 6, 'Partes y Repuestos'),
    ( 7, 'USB / Memorias'),
    ( 8, 'Micrófonos'),
    ( 9, 'Altavoces'),
    (10, 'Mouse y Periféricos');

-- ============================================================
-- USUARIOS DE PRUEBA
-- Contraseñas hasheadas con bcrypt (salt=10):
--   'admin123'  → $2b$10$s0obWGI3K0zhBs46cBLCr.Dhcooly3HMt9jCriDpJzm2IqBvAdsai
--   'cliente1'  → $2b$10$7voaTBUvzY5ObwDb0YQ/9uKgVXolNZZjbVqXsQ8MvAn8i5geDPAVS
--   'tecnico1'  → $2b$10$ogkOja6pe1lxDDoayvc7/./w1E9iBAbDIzOi8RgnpN0LgotRQl6Dq
--   'tecnico2'  → $2b$10$6QtE.fj//MuO58rd1vCgBOpyeXda1RSzP08ak.50ElvPjNXXzk7wS
--   'pass12345' → $2b$10$1L7uHPTBaiJyNdYF87WIo.qBmtVQ4TWlxRCX88WURglCh6DCfhAou
-- ============================================================
INSERT INTO Usuario
    (ID_Usuario, Codigo_Documento, Nombre, Fecha_Nacimiento, Direccion, Telefono, Correo, Contraseña, Codigo_Rol)
VALUES
-- Clientes (rol 2)
('10045612317', 1, 'Carlos Andrés Ramírez Torres',    '2000-05-12', 'Calle 72 #15-34',         '3108457291',  'carlostorres@email.com',        '$2b$10$s0obWGI3K0zhBs46cBLCr.Dhcooly3HMt9jCriDpJzm2IqBvAdsai', 2),
('10008547854', 1, 'María Fernanda Gómez Ríos',       '2000-05-13', 'Carrera 11 #84-20',        '3120938475',  'mariagomez@email.com',          '$2b$10$7voaTBUvzY5ObwDb0YQ/9uKgVXolNZZjbVqXsQ8MvAn8i5geDPAVS', 2),
('425124636',   5, 'Pepito Ángel Pérez Sánchez',      '2000-05-17', 'Calle 45 #22-30',          '3001234567',  'pepitopapi@gmail.com',          '$2b$10$s0obWGI3K0zhBs46cBLCr.Dhcooly3HMt9jCriDpJzm2IqBvAdsai', 2),
('25863675',    4, 'Balatro Balatrez Castillo',        '2000-05-18', 'Carrera 16 #78-45',        '3149876543',  'balatroestajugando@gmail.com',  '$2b$10$7voaTBUvzY5ObwDb0YQ/9uKgVXolNZZjbVqXsQ8MvAn8i5geDPAVS', 2),
('B5465312',    2, 'Olga Miriam De la Rosa Torres',   '2000-05-19', 'Avenida 19 #50-21',        '3115557890',  'miriamrosa@gmail.com',          '$2b$10$ogkOja6pe1lxDDoayvc7/./w1E9iBAbDIzOi8RgnpN0LgotRQl6Dq', 2),
('68943521',    3, 'Yenifer Viviana González González','2000-05-20', 'Calle 100 #12-90',         '3184328765',  'yenifervivi@gmail.com',         '$2b$10$6QtE.fj//MuO58rd1vCgBOpyeXda1RSzP08ak.50ElvPjNXXzk7wS', 2),
('55461352789', 2, 'Anderson Alejandro Paredes Arboleda','2000-05-21','Carrera 9 #35-15',        '3201112233',  'alejandroparedes@gmail.com',    '$2b$10$1L7uHPTBaiJyNdYF87WIo.qBmtVQ4TWlxRCX88WURglCh6DCfhAou', 2),
-- Técnicos (rol 1)
('67890123458', 2, 'Valeria Carolina Torres Aguirre', '2000-05-15', 'Transversal 6 #45-67',     '3258472930',  'carolinaaguirre@email.com',     '$2b$10$6QtE.fj//MuO58rd1vCgBOpyeXda1RSzP08ak.50ElvPjNXXzk7wS', 1),
('12938475602', 3, 'Tomás Alejandro García Montoya',  '2000-05-16', 'Carrera 13 #100-89',       '3273849201',  'tomasgarcia@email.com',         '$2b$10$1L7uHPTBaiJyNdYF87WIo.qBmtVQ4TWlxRCX88WURglCh6DCfhAou', 1),
-- Administrador (rol 3)
('91820473651', 1, 'José Miguel Herrera Salazar',     '2000-05-14', 'Calle 134 #19-50',         '3358472019',  'joseherre@email.com',           '$2b$10$ogkOja6pe1lxDDoayvc7/./w1E9iBAbDIzOi8RgnpN0LgotRQl6Dq', 3);

-- ============================================================
-- PRODUCTOS
-- CORRECCIÓN: PRO005 (USB 15GB) estaba en ID_Categoria=4 (Accesorios)
--             pero la categoría 7 es 'USB / Memorias' → corregido a 7
-- ============================================================
INSERT INTO Producto
    (Codigo_Producto, Nombre, Descripcion, Cantidad, Precio, Precio_Compra, Imagen, Activo_Catalogo, ID_Categoria)
VALUES
('PRO001', 'Audífonos de cable negro',        'Audífonos de cable estándar, color negro, conector 3.5mm',               10,  7500.00,  3500.00, '', 1, 1),
('PRO002', 'Audífonos Bluetooth recargables', 'Audífonos de conexión Bluetooth, batería recargable, autonomía 6h',       22, 20000.00, 10000.00, '', 1, 1),
('PRO003', 'Forro de celular estampado',       'Forros con diferentes motivos artísticos, varios modelos disponibles',    14, 14000.00,  5000.00, '', 1, 3),
('PRO004', 'Cargador Tipo-C',                 'Cargador de celular con entrada Tipo-C, 1m de cable, 2A',                 23, 18000.00,  8000.00, '', 1, 2),
('PRO005', 'Memoria USB 16 GB',               'Unidad de memoria USB 3.0 de 16 GB, compatible con PC y Mac',              7, 15000.00,  6000.00, '', 1, 7), -- CORRECCIÓN: categoría 7=USB
('PRO006', 'Forro protector azul',            'Forro rígido color azul, protección ante caídas, compatible varios modelos', 5, 17000.00,  6500.00, '', 1, 3),
('PRO007', 'Audífonos cable Tipo-C blanco',   'Audífonos de cable con conector Tipo-C, color blanco',                     9, 12000.00,  5000.00, '', 1, 1),
('PRO008', 'Cargador universal de baterías',  'Cargador externo para baterías extraíbles, 2 ranuras, indicador LED',      6,  6500.00,  2500.00, '', 1, 2),
('PRO009', 'Teclado mecánico negro',          'Teclado mecánico compacto 75%, retroiluminación RGB, color negro',        11, 30000.00, 15000.00, '', 1, 5),
('PRO010', 'Vidrio templado Xiaomi',          'Protector de pantalla de vidrio templado 9H para modelos Xiaomi',          4, 16000.00,  5000.00, '', 1, 5);

-- ============================================================
-- SERVICIOS
-- CORRECCIÓN: Fechas en formato ISO 'YYYY-MM-DD'
-- Los servicios con Etapa=100 están completados;
-- los con Etapa < 100 están en proceso
-- ============================================================
INSERT INTO Servicio
    (ID_Servicio, Descripcion, ID_Usuario, Precio, Movil_Nombre, Movil_Especificacion, Fecha, Etapa)
VALUES
-- Completados (Etapa = 100)
(1,  'Cambio de protector de pantalla',      '425124636',   25000.00, 'iPhone 16 Pro Max',    'Protector de pantalla roto, requiere reemplazo',              '2025-08-13', 100),
(2,  'Cambio de protector de pantalla',      '12938475602', 15000.00, 'Samsung Galaxy S25 Ultra', 'Protector de pantalla fisurado en la esquina',            '2025-08-14', 100),
(3,  'Reparación de display',                '67890123458', 100000.00,'Google Pixel 9',        'Display desconectado por golpe fuerte, necesita reemplazo',   '2025-08-15', 100),
(4,  'Reparación de display',                '55461352789', 100000.00,'Xiaomi 15 Ultra',       'Display desconectado por caída desde 1 metro',               '2025-08-16', 100),
(5,  'Cambio de batería',                    '68943521',    30000.00, 'Motorola Razr 60 Ultra','Batería inflada, necesita reemplazo inmediato',              '2025-08-17', 100),
-- En proceso (Etapa entre 1 y 99)
(6,  'Reparación de altavoces',              '25863675',    30000.00, 'Tecno Spark 60 Live',  'Altavoces con daño por humedad/agua',                        '2025-08-08',  50),
(7,  'Reparación entrada de carga',          '10008547854', 20000.00, 'Oppo Reno 12 Plus',    'Puerto USB-C dañado, no carga el equipo',                    '2025-08-09',  60),
(8,  'Cambio de pantalla',                   '10045612317', 40000.00, 'Motorola Edge 40 Neo', 'Pantalla rota con líneas visibles, táctil sin respuesta',     '2025-08-10',  80),
(9,  'Reparación de botón físico',           '25863675',    40000.00, 'Motorola Moto G54',    'Botón de volumen atascado, no responde al presionar',         '2025-08-11',  40),
(10, 'Reparación de cámara principal',       'B5465312',    60000.00, 'Apple iPhone 6',       'Cámara trasera sin imagen, sensor desconectado',              '2025-08-12',  70);

-- ============================================================
-- CHATS (uno por servicio, asociado al cliente del servicio)
-- ============================================================
INSERT INTO Chat (Codigo_Chat, ID_Usuario, ID_Servicio) VALUES
(1,  '425124636',   1),
(2,  '12938475602', 2),
(3,  '67890123458', 3),
(4,  '55461352789', 4),
(5,  '68943521',    5),
(6,  '25863675',    6),
(7,  '10008547854', 7),
(8,  '10045612317', 8),
(9,  '25863675',    9),
(10, 'B5465312',    10);

-- ============================================================
-- MENSAJES
-- Fecha_Mensaje como DATETIME (hora incluida)
-- Los mensajes deben ser POSTERIORES a la creación del servicio
-- ============================================================
INSERT INTO Mensajes (Codigo_Mensaje, Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado) VALUES
(1,  1,  '425124636',   '2025-08-13 09:15:00', 'Buenos días, ¿cuándo estará listo mi equipo?',                        1),
(2,  2,  '12938475602', '2025-08-14 10:30:00', '¿Me pueden dar un presupuesto estimado para la reparación?',          0),
(3,  3,  '67890123458', '2025-08-15 11:45:00', 'Hola, ¿hay alguna novedad con mi teléfono?',                          1),
(4,  4,  '55461352789', '2025-08-16 08:00:00', 'Buen día, ¿en qué estado va la reparación del display?',              0),
(5,  5,  '68943521',    '2025-08-17 14:20:00', 'Gracias por atenderme, espero su respuesta pronto.',                  1),
(6,  6,  '25863675',    '2025-08-08 15:10:00', '¿Ya diagnosticaron el problema de los altavoces?',                    1),
(7,  7,  '10008547854', '2025-08-09 09:50:00', 'Confirmen cuándo pueden reemplazar la entrada USB del equipo.',       0),
(8,  8,  '10045612317', '2025-08-10 16:30:00', 'Avísenme si el costo final cambia, por favor.',                       1),
(9,  9,  '25863675',    '2025-08-11 11:00:00', '¿Cuánto tardarán en reparar el botón de volumen?',                   0),
(10, 10, 'B5465312',    '2025-08-12 13:45:00', 'Espero que la cámara tenga solución. Gracias por la atención.',       0);

-- ============================================================
-- COMENTARIOS
-- Fecha como DATETIME; corregidos comentarios con ortografía mejorada
-- ============================================================
INSERT INTO Comentarios (Codigo_Comentario, ID_Usuario, Comentario, Fecha_Comentario, Estrellas) VALUES
(1,  '425124636',   'Excelente servicio, cambiaron el protector de mi iPhone en menos de 20 minutos. ¡Muy recomendados!',             '2025-08-14 10:00:00', 5),
(2,  '12938475602', 'Buen trabajo en general, aunque el tiempo de espera fue un poco largo. El resultado final fue muy bueno.',         '2025-08-16 09:30:00', 4),
(3,  '67890123458', 'Repararon el display de mi Pixel 9 como nuevo. Personal amable y precios justos.',                                '2025-08-17 11:00:00', 5),
(4,  '55461352789', 'Muy buena atención, solucionaron el problema del display rápidamente. Volvería sin dudarlo.',                      '2025-08-18 08:45:00', 5),
(5,  '68943521',    'Cambiaron la batería de mi Motorola y quedó como nuevo. Excelente relación calidad-precio.',                       '2025-08-19 14:00:00', 4),
(6,  '25863675',    'El técnico fue muy profesional. Me explicó todo el proceso antes de comenzar la reparación.',                     '2025-08-22 16:00:00', 5),
(7,  '10008547854', 'Repararon la entrada USB de mi Oppo en el día. Muy satisfecha con el servicio.',                                  '2025-08-23 10:30:00', 4),
(8,  '10045612317', 'Buen servicio aunque el precio me pareció un poco elevado. La reparación quedó perfecta.',                        '2025-08-24 09:00:00', 3),
(9,  '25863675',    'Segunda vez que los visito y siempre cumplen con lo prometido. Muy recomendados para reparaciones de celulares.', '2025-08-24 15:20:00', 5),
(10, 'B5465312',    'Arreglaron la cámara de mi iPhone 6 perfectamente. Pensé que no tenía solución y la encontraron.',               '2025-08-22 11:45:00', 5);

-- ============================================================
-- PREGUNTAS DE PRODUCTOS
-- Se añaden respuestas de ejemplo en algunos casos
-- ============================================================
INSERT INTO Pregunta (ID_Consulta, ID_Usuario, Codigo_Producto, Pregunta, Fecha, Respuesta, ID_Tecnico_Responde, Fecha_Respuesta) VALUES
(1,  '425124636',   'PRO001', '¿Están disponibles estos audífonos para recoger hoy?',                       '2025-08-13', 'Sí, tenemos en stock. Puedes pasar por la tienda.',                              '12938475602', '2025-08-13 10:30:00'),
(2,  '12938475602', 'PRO002', 'Buenos días, ¿cuánto dura la batería de estos audífonos Bluetooth?',         '2025-08-15', 'La autonomía es de aproximadamente 6 horas con volumen al 70%.',                 '67890123458', '2025-08-15 11:00:00'),
(3,  '67890123458', 'PRO003', 'Hola, ¿tienen el forro con motivo de montañas?',                             '2025-08-15', NULL, NULL, NULL),
(4,  '55461352789', 'PRO004', 'Buenas noches, ¿este cargador Tipo-C sirve para Samsung Galaxy?',            '2025-08-24', 'Sí, es compatible con todos los dispositivos Tipo-C incluyendo Samsung.',        '12938475602', '2025-08-24 08:00:00'),
(5,  '10045612317', 'PRO005', 'Hola, ¿de qué tamaños tienen estas memorias USB?',                           '2025-08-22', 'Tenemos de 16 GB actualmente. Próximamente habrá de 32 GB.',                     '67890123458', '2025-08-22 09:45:00'),
(6,  '25863675',    'PRO006', 'Hola, ¿aún está disponible el forro protector azul?',                        '2025-08-24', NULL, NULL, NULL),
(7,  '10008547854', 'PRO007', '¿Los audífonos Tipo-C tienen botones de control de volumen?',                '2025-08-06', 'Sí, incluyen botón de pausa y control de volumen en el cable.',                  '12938475602', '2025-08-06 12:00:00'),
(8,  '10045612317', 'PRO008', 'Hola, ¿cuántas baterías caben en el cargador universal?',                    '2025-08-25', 'El cargador tiene 2 ranuras para baterías extraíbles.',                          '67890123458', '2025-08-25 10:00:00'),
(9,  '25863675',    'PRO009', '¿El teclado mecánico tiene garantía?',                                       '2025-08-22', 'Sí, 6 meses de garantía por defectos de fábrica.',                               '12938475602', '2025-08-22 14:30:00'),
(10, 'B5465312',    'PRO010', 'Buenos días, ¿para qué modelos de Xiaomi es compatible el vidrio templado?', '2025-08-27', NULL, NULL, NULL);

-- ============================================================
-- HISTORIAL DE SERVICIOS
-- Estado: 1 = evento procesado/completado, 0 = pendiente
-- Etapa_Registro: etapa del servicio al momento de registrar el evento
-- ============================================================
INSERT INTO Historial_Servicios (ID_Historial, ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado, Etapa_Registro) VALUES
(1,  1,  '2025-08-13 09:00:00', 'Servicio recibido: protector de pantalla roto',                          1, 0),
(2,  1,  '2025-08-13 11:00:00', 'Reparación completada: protector de pantalla reemplazado exitosamente',  1, 100),
(3,  2,  '2025-08-14 09:00:00', 'Servicio recibido: protector de pantalla fisurado',                      1, 0),
(4,  2,  '2025-08-14 14:00:00', 'Reparación completada: protector de pantalla reemplazado',               1, 100),
(5,  3,  '2025-08-15 08:30:00', 'Servicio recibido: display desconectado por golpe',                      1, 0),
(6,  3,  '2025-08-15 16:00:00', 'Reparación completada: display reemplazado y calibrado',                 1, 100),
(7,  4,  '2025-08-16 09:00:00', 'Servicio recibido: display con daño por caída',                          1, 0),
(8,  4,  '2025-08-16 17:00:00', 'Reparación completada: display reemplazado',                             1, 100),
(9,  5,  '2025-08-17 10:00:00', 'Servicio recibido: batería inflada detectada',                           1, 0),
(10, 5,  '2025-08-17 13:00:00', 'Reparación completada: batería reemplazada por una nueva',               1, 100),
(11, 6,  '2025-08-08 09:00:00', 'Servicio recibido: altavoces con daño por humedad',                      1, 0),
(12, 6,  '2025-08-09 10:00:00', 'Diagnóstico completado: altavoces necesitan limpieza y reemplazo',       1, 50),
(13, 7,  '2025-08-09 08:30:00', 'Servicio recibido: puerto USB-C con obstrucción',                        1, 0),
(14, 7,  '2025-08-10 11:00:00', 'Limpieza realizada: se encontró objeto extraño en el puerto',            1, 60),
(15, 8,  '2025-08-10 09:00:00', 'Servicio recibido: pantalla rota con líneas y sin táctil',               1, 0),
(16, 8,  '2025-08-11 15:00:00', 'Pantalla reemplazada, pendiente calibración final del táctil',           0, 80),
(17, 9,  '2025-08-11 08:00:00', 'Servicio recibido: botón de volumen atascado',                           1, 0),
(18, 9,  '2025-08-12 12:00:00', 'Diagnóstico: botón requiere limpieza interna del módulo',                0, 40),
(19, 10, '2025-08-12 09:00:00', 'Servicio recibido: cámara principal sin imagen',                         1, 0),
(20, 10, '2025-08-13 10:00:00', 'Diagnóstico: flex de cámara desconectado, en proceso de reparación',    0, 70);

-- ============================================================
-- NOTIFICACIONES DE PRUEBA (estructura mejorada)
-- ============================================================
INSERT INTO Notificaciones (ID_Usuario_Destino, ID_Usuario_Origen, ID_Servicio, Tipo_Notificacion, Leida) VALUES
('425124636',   '91820473651', 1,  'Su servicio #1 ha sido completado. Puede pasar a recoger su equipo.', 1),
('12938475602', '91820473651', 2,  'Su servicio #2 ha sido completado exitosamente.',                       1),
('67890123458', '91820473651', 3,  'Su servicio #3 ha sido completado. Display reparado con éxito.',       1),
('55461352789', '91820473651', 4,  'Su servicio #4 ha sido completado.',                                   1),
('68943521',    '91820473651', 5,  'Su servicio #5 ha sido completado. Batería reemplazada.',              1),
('25863675',    '91820473651', 6,  'Su servicio #6 está en proceso. Etapa: diagnóstico completado.',       0),
('10008547854', '91820473651', 7,  'Su servicio #7 está en proceso. Limpieza del puerto realizada.',       0),
('10045612317', '91820473651', 8,  'Su servicio #8 está avanzando. Pantalla instalada, calibrando.',       0),
('25863675',    '91820473651', 9,  'Su servicio #9 está en diagnóstico.',                                  0),
('B5465312',    '91820473651', 10, 'Su servicio #10: técnico trabajando en la cámara.',                    0);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
