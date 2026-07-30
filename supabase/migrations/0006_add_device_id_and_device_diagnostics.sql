-- PASO A1: Agregar device_id a tabla leads y crear tabla device_diagnostics
--
-- `device_id` en leads — identifica el dispositivo desde el que se originó el lead
-- `device_diagnostics` — tabla de diagnóstico por dispositivo con referencias a leads, diagnosticos y resultados

-- Agregar device_id a leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS device_id UUID;

CREATE INDEX IF NOT EXISTS idx_leads_device_id ON leads(device_id);

-- Crear tabla device_diagnostics
CREATE TABLE IF NOT EXISTS device_diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    diagnostico_id UUID REFERENCES diagnosticos(id) ON DELETE CASCADE,
    resultado_id UUID REFERENCES resultados(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_diagnostics_device_id ON device_diagnostics(device_id);
CREATE INDEX IF NOT EXISTS idx_device_diagnostics_lead_id ON device_diagnostics(lead_id);