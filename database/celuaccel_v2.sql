-- ============================================================
--  CeluAccel — Script SQL v2.0  (Consistente con documentación)
--  Generado: 2026-08-09
--  Cambios vs dump original:
--    · roles.Descripcion_Rol  → Nombre_Rol          (RF-011)
--    · tipo_documento.Nombre_Documento → Tipo_Documento (RF-012)
--    · Etapa: 0=Pendiente 1=En proceso 2=Terminado -1=Cancelado (RN-014)
--    · historial_servicios.Etapa_Registro: misma escala
--    · 16 FK completas (antes solo 3 existían)
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `historial_servicios`;
DROP TABLE IF EXISTS `notificaciones`;
DROP TABLE IF EXISTS `mensajes`;
DROP TABLE IF EXISTS `chat`;
DROP TABLE IF EXISTS `comentarios`;
DROP TABLE IF EXISTS `pregunta`;
DROP TABLE IF EXISTS `servicio`;
DROP TABLE IF EXISTS `producto`;
DROP TABLE IF EXISTS `categoria`;
DROP TABLE IF EXISTS `usuario`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `tipo_documento`;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Roles ─────────────────────────────────────────────────────────────────────
CREATE TABLE `roles` (
  `Codigo_Rol` tinyint(3) UNSIGNED NOT NULL,
  `Nombre_Rol` varchar(50) NOT NULL,
  PRIMARY KEY (`Codigo_Rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` VALUES (1,'Técnico'),(2,'Cliente'),(3,'Administrador');

-- ── Tipo de Documento ─────────────────────────────────────────────────────────
CREATE TABLE `tipo_documento` (
  `Codigo_Documento` tinyint(3) UNSIGNED NOT NULL,
  `Tipo_Documento`   varchar(60) NOT NULL,
  PRIMARY KEY (`Codigo_Documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tipo_documento` VALUES
  (1,'Cédula de Ciudadanía'),
  (2,'Tarjeta de Identidad'),
  (3,'Cédula de Extranjería'),
  (4,'Pasaporte'),
  (5,'NIT');

-- ── Categoría ────────────────────────────────────────────────────────────────
CREATE TABLE `categoria` (
  `ID_Categoria`     smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `Nombre_Categoria` varchar(80) NOT NULL,
  PRIMARY KEY (`ID_Categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categoria` VALUES
  (1,'Pantallas'),(2,'Baterías'),(3,'Cámaras'),
  (4,'Conectores y Puertos'),(5,'Accesorios');

-- ── Usuario ───────────────────────────────────────────────────────────────────
CREATE TABLE `usuario` (
  `ID_Usuario`        varchar(20)  NOT NULL,
  `Nombre`            varchar(120) NOT NULL,
  `Correo`            varchar(120) NOT NULL,
  `Contraseña`        varchar(255) NOT NULL,
  `Codigo_Rol`        tinyint(3) UNSIGNED NOT NULL DEFAULT 2,
  `Fecha_Nacimiento`  date         DEFAULT NULL,
  `Direccion`         varchar(200) DEFAULT NULL,
  `Telefono`          varchar(20)  DEFAULT NULL,
  `Codigo_Documento`  tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`ID_Usuario`),
  UNIQUE KEY `uk_correo` (`Correo`),
  KEY `idx_usuario_rol`       (`Codigo_Rol`),
  KEY `idx_usuario_documento` (`Codigo_Documento`),
  CONSTRAINT `fk_usuario_rol`
    FOREIGN KEY (`Codigo_Rol`) REFERENCES `roles` (`Codigo_Rol`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_documento`
    FOREIGN KEY (`Codigo_Documento`) REFERENCES `tipo_documento` (`Codigo_Documento`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `usuario` (`ID_Usuario`,`Nombre`,`Correo`,`Contraseña`,`Codigo_Rol`,`Fecha_Nacimiento`,`Direccion`,`Telefono`,`Codigo_Documento`) VALUES
('1000000001','Administrador Principal','admin@celuaccel.com',   '$2b$10$iBP7r7l6qKWNDi4v/H48yOhF0qFGi2VtlhvQGh5wU2KpVRJzN9Fqi',3,'1985-03-15','Calle 10 # 20-30, Medellín',  '3001234567',1),
('1000000002','Técnico Juan Pérez',     'tecnico@celuaccel.com', '$2b$10$iBP7r7l6qKWNDi4v/H48yOhF0qFGi2VtlhvQGh5wU2KpVRJzN9Fqi',1,'1992-07-20','Carrera 5 # 10-15, Medellín', '3019876543',1),
('1000000003','María García',           'maria@correo.com',      '$2b$10$iBP7r7l6qKWNDi4v/H48yOhF0qFGi2VtlhvQGh5wU2KpVRJzN9Fqi',2,'1998-11-05','Avenida 80 # 45-10, Medellín','3151234567',1),
('1000000004','Carlos Rodríguez',       'carlos@correo.com',     '$2b$10$iBP7r7l6qKWNDi4v/H48yOhF0qFGi2VtlhvQGh5wU2KpVRJzN9Fqi',2,'1995-04-22','Calle 50 # 30-20, Bogotá',   '3201234567',1),
('1000000005','Ana López',              'ana@correo.com',        '$2b$10$iBP7r7l6qKWNDi4v/H48yOhF0qFGi2VtlhvQGh5wU2KpVRJzN9Fqi',2,'2000-08-17','Carrera 70 # 12-55, Cali',   '3101122334',1);

-- ── Producto ──────────────────────────────────────────────────────────────────
CREATE TABLE `producto` (
  `Codigo_Producto` varchar(30)       NOT NULL,
  `Nombre`          varchar(150)      NOT NULL,
  `Descripcion`     text              DEFAULT NULL,
  `Cantidad`        int(11)           NOT NULL DEFAULT 0,
  `Precio`          decimal(12,2)     NOT NULL,
  `Precio_Compra`   decimal(12,2)     DEFAULT NULL,
  `Imagen`          varchar(255)      DEFAULT NULL,
  `Activo_Catalogo` tinyint(1)        NOT NULL DEFAULT 1,
  `ID_Categoria`    smallint(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`Codigo_Producto`),
  KEY `idx_producto_categoria` (`ID_Categoria`),
  CONSTRAINT `fk_producto_categoria`
    FOREIGN KEY (`ID_Categoria`) REFERENCES `categoria` (`ID_Categoria`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `producto` VALUES
('PANT-S22-001', 'Pantalla Samsung Galaxy S22',    'Pantalla AMOLED original con digitalizador', 15,280000.00,180000.00,NULL,1,1),
('PANT-IP13-001','Pantalla iPhone 13',              'Display LCD original Apple con marco',        10,350000.00,220000.00,NULL,1,1),
('BAT-S21-001',  'Batería Samsung Galaxy S21',      'Batería 4000mAh original',                   20, 85000.00, 55000.00,NULL,1,2),
('BAT-IP12-001', 'Batería iPhone 12',               'Batería 2815mAh certificada Apple',           8,110000.00, 70000.00,NULL,1,2),
('CAM-S20-001',  'Módulo Cámara Samsung Galaxy S20','Cámara trasera triple 64MP original',         5,320000.00,200000.00,NULL,1,3),
('CON-USBC-001', 'Conector USB-C Universal',        'Puerto de carga USB Tipo C con flex',        30, 25000.00, 12000.00,NULL,1,4),
('ACC-CASE-001', 'Funda Protectora Silicona',       'Funda transparente universal',                50, 15000.00,  6000.00,NULL,1,5);

-- ── Servicio  (Etapa: 0=Pendiente 1=En proceso 2=Terminado -1=Cancelado) ─────
CREATE TABLE `servicio` (
  `ID_Servicio`          int(11)       NOT NULL AUTO_INCREMENT,
  `Descripcion`          text          DEFAULT NULL,
  `ID_Usuario`           varchar(20)   NOT NULL,
  `Precio`               decimal(12,2) DEFAULT 0.00,
  `Movil_Nombre`         varchar(100)  DEFAULT NULL,
  `Movil_Especificacion` varchar(255)  DEFAULT NULL,
  `Fecha`                date          DEFAULT NULL,
  `Etapa`                smallint(6)   NOT NULL DEFAULT 0
                           COMMENT '0=Pendiente 1=En proceso 2=Terminado -1=Cancelado',
  `Fecha_Creacion`       datetime      NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID_Servicio`),
  KEY `idx_servicio_usuario` (`ID_Usuario`),
  CONSTRAINT `fk_servicio_usuario`
    FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `servicio` (`ID_Servicio`,`Descripcion`,`ID_Usuario`,`Precio`,`Movil_Nombre`,`Movil_Especificacion`,`Fecha`,`Etapa`) VALUES
(1,'Pantalla rota, no enciende',     '1000000003',280000.00,'Samsung Galaxy S22','Golpe frontal, cristal fragmentado', '2026-07-10', 2),
(2,'No carga la batería',            '1000000003', 85000.00,'Samsung Galaxy S21','Batería hinchada, no carga',         '2026-07-25',-1),
(3,'Cámara trasera borrosa',         '1000000004',320000.00,'Samsung Galaxy S20','Imágenes desenfocadas permanentes',  '2026-08-01', 1),
(4,'Cambio de batería',              '1000000004',110000.00,'iPhone 12',         'Batería al 60% de salud',            '2026-08-05', 0),
(5,'Pantalla táctil no responde',    '1000000005',350000.00,'iPhone 13',         'Touch sin respuesta en zona inferior','2026-08-07', 0);

-- ── Historial de Servicios ────────────────────────────────────────────────────
CREATE TABLE `historial_servicios` (
  `ID_Registro`        int(11)     NOT NULL AUTO_INCREMENT,
  `ID_Servicio`        int(11)     NOT NULL,
  `Fecha_Evento`       datetime    NOT NULL DEFAULT current_timestamp(),
  `Descripcion_Evento` text        DEFAULT NULL,
  `Estado`             varchar(80) DEFAULT NULL,
  `Etapa_Registro`     smallint(6) DEFAULT NULL
                         COMMENT '0=Pendiente 1=En proceso 2=Terminado -1=Cancelado',
  PRIMARY KEY (`ID_Registro`),
  KEY `idx_historial_servicio` (`ID_Servicio`),
  CONSTRAINT `fk_historial_servicio`
    FOREIGN KEY (`ID_Servicio`) REFERENCES `servicio` (`ID_Servicio`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `historial_servicios` (`ID_Registro`,`ID_Servicio`,`Fecha_Evento`,`Descripcion_Evento`,`Estado`,`Etapa_Registro`) VALUES
(1,1,'2026-07-10 09:00:00','Dispositivo recibido en tienda',         'Ingresado',  0),
(2,1,'2026-07-11 10:30:00','Diagnóstico completado: pantalla dañada','En proceso', 1),
(3,1,'2026-07-15 16:00:00','Pantalla reemplazada y probada OK',      'Terminado',  2),
(4,2,'2026-07-25 11:00:00','Dispositivo recibido',                   'Ingresado',  0),
(5,2,'2026-07-26 09:00:00','Cliente solicita cancelación',           'Cancelado', -1),
(6,3,'2026-08-01 08:30:00','Dispositivo recibido',                   'Ingresado',  0),
(7,3,'2026-08-02 14:00:00','Diagnóstico: módulo de cámara averiado', 'En proceso', 1),
(8,4,'2026-08-05 10:00:00','Dispositivo recibido',                   'Ingresado',  0),
(9,5,'2026-08-07 09:15:00','Dispositivo recibido',                   'Ingresado',  0);

-- ── Chat ──────────────────────────────────────────────────────────────────────
CREATE TABLE `chat` (
  `Codigo_Chat`  int(11)     NOT NULL AUTO_INCREMENT,
  `ID_Usuario`   varchar(20) NOT NULL,
  `ID_Servicio`  int(11)     DEFAULT NULL,
  `Fecha_Inicio` datetime    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Codigo_Chat`),
  KEY `idx_chat_usuario`  (`ID_Usuario`),
  KEY `idx_chat_servicio` (`ID_Servicio`),
  CONSTRAINT `fk_chat_usuario`
    FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_servicio`
    FOREIGN KEY (`ID_Servicio`) REFERENCES `servicio` (`ID_Servicio`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `chat` VALUES (1,'1000000003',1,'2026-07-10 09:05:00'),(2,'1000000004',3,'2026-08-01 08:35:00');

-- ── Mensajes ──────────────────────────────────────────────────────────────────
CREATE TABLE `mensajes` (
  `Codigo_Mensaje` int(11)     NOT NULL AUTO_INCREMENT,
  `Codigo_Chat`    int(11)     NOT NULL,
  `ID_Usuario`     varchar(20) DEFAULT NULL,
  `Mensaje`        text        NOT NULL,
  `Fecha_Mensaje`  datetime    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Codigo_Mensaje`),
  KEY `idx_mensaje_chat`    (`Codigo_Chat`),
  KEY `idx_mensaje_usuario` (`ID_Usuario`),
  CONSTRAINT `fk_mensaje_chat`
    FOREIGN KEY (`Codigo_Chat`) REFERENCES `chat` (`Codigo_Chat`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mensaje_usuario`
    FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mensajes` (`Codigo_Mensaje`,`Codigo_Chat`,`ID_Usuario`,`Mensaje`,`Fecha_Mensaje`) VALUES
(1,1,'1000000003','¿Cuándo estará lista mi pantalla?',                      '2026-07-11 11:00:00'),
(2,1,'1000000002','Ya terminamos el diagnóstico, mañana la reemplazamos.',  '2026-07-11 11:30:00'),
(3,1,'1000000003','Perfecto, muchas gracias.',                               '2026-07-11 11:32:00'),
(4,2,'1000000004','Hola, ¿ya revisaron la cámara de mi celular?',           '2026-08-02 15:00:00'),
(5,2,'1000000002','Sí, confirmamos que el módulo está dañado. Lo pedimos.', '2026-08-02 15:20:00');

-- ── Comentarios ───────────────────────────────────────────────────────────────
CREATE TABLE `comentarios` (
  `Codigo_Comentario` int(11)     NOT NULL AUTO_INCREMENT,
  `ID_Usuario`        varchar(20) NOT NULL,
  `Comentario`        text        NOT NULL,
  `Fecha_Comentario`  date        NOT NULL,
  `Estrellas`         tinyint(4)  NOT NULL DEFAULT 5 COMMENT 'Calificación 1-5',
  PRIMARY KEY (`Codigo_Comentario`),
  KEY `idx_comentario_usuario` (`ID_Usuario`),
  CONSTRAINT `fk_comentario_usuario`
    FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `comentarios` VALUES
(1,'1000000003','Excelente servicio, quedó como nuevo. Muy recomendado.','2026-07-16',5),
(2,'1000000004','Buen servicio pero tardó un poco más de lo estimado.',  '2026-08-04',4);

-- ── Pregunta ──────────────────────────────────────────────────────────────────
CREATE TABLE `pregunta` (
  `ID_Consulta`         int(11)       NOT NULL AUTO_INCREMENT,
  `ID_Usuario`          varchar(20)   NOT NULL,
  `Codigo_Producto`     varchar(30)   NOT NULL,
  `Pregunta`            varchar(1000) NOT NULL,
  `Fecha`               date          NOT NULL,
  `Respuesta`           varchar(1000) DEFAULT NULL,
  `ID_Tecnico_Responde` varchar(20)   DEFAULT NULL,
  `Fecha_Respuesta`     datetime      DEFAULT NULL,
  PRIMARY KEY (`ID_Consulta`),
  KEY `idx_pregunta_usuario`  (`ID_Usuario`),
  KEY `idx_pregunta_producto` (`Codigo_Producto`),
  KEY `idx_pregunta_tecnico`  (`ID_Tecnico_Responde`),
  CONSTRAINT `fk_pregunta_usuario`
    FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pregunta_producto`
    FOREIGN KEY (`Codigo_Producto`) REFERENCES `producto` (`Codigo_Producto`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pregunta_tecnico`
    FOREIGN KEY (`ID_Tecnico_Responde`) REFERENCES `usuario` (`ID_Usuario`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pregunta` VALUES
(1,'1000000003','PANT-S22-001', '¿La pantalla incluye el marco?',       '2026-07-20','Incluye digitalizador y marco lateral.','1000000002','2026-07-20 14:30:00'),
(2,'1000000004','BAT-IP12-001', '¿La batería tiene garantía?',          '2026-08-03','Sí, 3 meses contra defectos de fábrica.','1000000002','2026-08-03 10:00:00'),
(3,'1000000005','PANT-IP13-001','¿Cuánto demora el cambio de pantalla?','2026-08-07', NULL, NULL, NULL);

-- ── Notificaciones ────────────────────────────────────────────────────────────
CREATE TABLE `notificaciones` (
  `ID_Notificacion`    int(11)     NOT NULL AUTO_INCREMENT,
  `ID_Usuario_Destino` varchar(20) NOT NULL,
  `ID_Usuario_Origen`  varchar(20) DEFAULT NULL,
  `ID_Servicio`        int(11)     DEFAULT NULL,
  `Mensaje`            text        NOT NULL,
  `Leida`              tinyint(1)  NOT NULL DEFAULT 0,
  `Fecha`              datetime    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID_Notificacion`),
  KEY `idx_noti_destino`  (`ID_Usuario_Destino`),
  KEY `idx_noti_origen`   (`ID_Usuario_Origen`),
  KEY `idx_noti_servicio` (`ID_Servicio`),
  CONSTRAINT `fk_noti_destino`
    FOREIGN KEY (`ID_Usuario_Destino`) REFERENCES `usuario` (`ID_Usuario`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_noti_origen`
    FOREIGN KEY (`ID_Usuario_Origen`) REFERENCES `usuario` (`ID_Usuario`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_noti_servicio`
    FOREIGN KEY (`ID_Servicio`) REFERENCES `servicio` (`ID_Servicio`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notificaciones` (`ID_Notificacion`,`ID_Usuario_Destino`,`ID_Usuario_Origen`,`ID_Servicio`,`Mensaje`,`Leida`,`Fecha`) VALUES
(1,'1000000003','1000000002',1,'Tu dispositivo está listo para retirar. Por favor acude a la tienda.',1,'2026-07-15 16:05:00'),
(2,'1000000004','1000000002',3,'Hemos iniciado el diagnóstico de tu equipo.',0,'2026-08-02 14:00:00'),
(3,'1000000005','1000000002',5,'Tu dispositivo ha sido recibido y registrado en el sistema.',0,'2026-08-07 09:20:00');

COMMIT;
