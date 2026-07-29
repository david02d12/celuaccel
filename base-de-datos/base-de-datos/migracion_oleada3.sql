-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIONES CELUACCEL — OLEADA 3
-- RF-018: Proveedores y Compras de Reabastecimiento
-- Fecha: 27/07/2026
-- ═══════════════════════════════════════════════════════════════════

USE celuaccel;

-- ───────────────────────────────────────────────────────────────────
-- RF-018: Tabla Proveedor
-- ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS Proveedor (
    ID_Proveedor   INT          NOT NULL AUTO_INCREMENT,
    Nombre_Empresa VARCHAR(150) NOT NULL,
    NIT            VARCHAR(30)  NULL UNIQUE COMMENT 'Número de identificación tributaria',
    Telefono       VARCHAR(20)  NULL,
    Correo         VARCHAR(100) NULL,
    Direccion      VARCHAR(250) NULL,
    Contacto       VARCHAR(100) NULL COMMENT 'Nombre del contacto principal',

    PRIMARY KEY (ID_Proveedor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RF-018: Proveedores de repuestos e insumos';

-- ───────────────────────────────────────────────────────────────────
-- RF-018: Tabla Compra (reabastecimiento de inventario)
-- ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS Compra (
    ID_Compra       INT          NOT NULL AUTO_INCREMENT,
    ID_Proveedor    INT          NOT NULL,
    Codigo_Producto VARCHAR(50)  NOT NULL,
    Cantidad        INT          NOT NULL,
    Precio_Unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Fecha_Compra    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (ID_Compra),

    CONSTRAINT fk_compra_proveedor
        FOREIGN KEY (ID_Proveedor) REFERENCES Proveedor(ID_Proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_compra_producto
        FOREIGN KEY (Codigo_Producto) REFERENCES Producto(Codigo_Producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_compra_cantidad CHECK (Cantidad > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RF-018: Compras de reabastecimiento de inventario';

CREATE INDEX idx_compra_proveedor ON Compra(ID_Proveedor);
CREATE INDEX idx_compra_producto  ON Compra(Codigo_Producto);
CREATE INDEX idx_compra_fecha     ON Compra(Fecha_Compra DESC);

-- ───────────────────────────────────────────────────────────────────
-- VERIFICACIÓN
-- ───────────────────────────────────────────────────────────────────
SELECT 'Migracion Oleada 3 completada' AS Estado, NOW() AS Fecha;
SHOW TABLES LIKE 'Proveedor';
SHOW TABLES LIKE 'Compra';
