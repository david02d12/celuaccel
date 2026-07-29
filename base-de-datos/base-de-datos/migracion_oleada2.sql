-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIONES CELUACCEL — OLEADA 2
-- Ejecutar en orden sobre la base de datos 'celuaccel'
-- Fecha: 27/07/2026
-- ═══════════════════════════════════════════════════════════════════

USE celuaccel;

-- ───────────────────────────────────────────────────────────────────
-- RF-014: Asignación de órdenes a técnico
-- ───────────────────────────────────────────────────────────────────

ALTER TABLE Servicio
    ADD COLUMN ID_Tecnico VARCHAR(20) NULL DEFAULT NULL
        COMMENT 'Técnico asignado a esta orden (RF-014)',
    ADD CONSTRAINT fk_servicio_tecnico
        FOREIGN KEY (ID_Tecnico) REFERENCES Usuario(ID_Usuario)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

CREATE INDEX idx_servicio_tecnico ON Servicio(ID_Tecnico);

-- ───────────────────────────────────────────────────────────────────
-- RF-015: Repuestos usados en servicio
-- ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS Servicio_Producto (
    ID_Servicio     INT          NOT NULL  COMMENT 'Orden de servicio',
    Codigo_Producto VARCHAR(50)  NOT NULL  COMMENT 'Repuesto utilizado',
    Cantidad        INT          NOT NULL DEFAULT 1,

    PRIMARY KEY (ID_Servicio, Codigo_Producto),

    CONSTRAINT fk_sp_servicio
        FOREIGN KEY (ID_Servicio) REFERENCES Servicio(ID_Servicio)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_sp_producto
        FOREIGN KEY (Codigo_Producto) REFERENCES Producto(Codigo_Producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_sp_cantidad CHECK (Cantidad > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RF-015: Repuestos consumidos por orden de servicio';

-- ───────────────────────────────────────────────────────────────────
-- RF-022: Garantías de Servicio
-- ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS Garantia (
    ID_Garantia          INT    NOT NULL AUTO_INCREMENT,
    ID_Servicio          INT    NOT NULL,
    Fecha_Inicio         DATE   NOT NULL,
    Fecha_Fin            DATE   NOT NULL,
    Descripcion_Garantia TEXT   NOT NULL,

    PRIMARY KEY (ID_Garantia),

    CONSTRAINT fk_garantia_servicio
        FOREIGN KEY (ID_Servicio) REFERENCES Servicio(ID_Servicio)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_garantia_fechas CHECK (Fecha_Fin > Fecha_Inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RF-022: Garantías post-servicio';

CREATE INDEX idx_garantia_servicio ON Garantia(ID_Servicio);
CREATE INDEX idx_garantia_fin      ON Garantia(Fecha_Fin);

-- ───────────────────────────────────────────────────────────────────
-- VERIFICACIÓN
-- ───────────────────────────────────────────────────────────────────
SELECT 'Migracion completada exitosamente' AS Estado, NOW() AS Fecha;
DESCRIBE Servicio;
SHOW TABLES LIKE 'Servicio_Producto';
SHOW TABLES LIKE 'Garantia';
