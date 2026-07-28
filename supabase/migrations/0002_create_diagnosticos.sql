CREATE TABLE diagnosticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  respuestas JSONB NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'completo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diagnosticos_lead_id ON diagnosticos(lead_id);
CREATE INDEX idx_diagnosticos_created_at ON diagnosticos(created_at);
