-- Fase de rediseño: dos columnas nuevas en `leads`.
--
-- `empresa`            — el formulario ahora pide el nombre de la empresa
--                        además del nombre de la persona.
-- `facturacion_rango`  — el formulario pide un rango, no una cifra exacta.
--                        `facturacion_mensual_cop` se sigue guardando (es el
--                        piso del rango elegido) para no romper consultas ni
--                        índices existentes; este campo conserva el rango tal
--                        como lo eligió el usuario.
--
-- Ambas son NULLABLE a propósito: es un cambio aditivo, los leads que ya
-- existen quedan válidos y la migración se puede revertir sin pérdida.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS empresa VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS facturacion_rango VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_leads_facturacion_rango ON leads(facturacion_rango);
