CREATE TABLE resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostico_id UUID NOT NULL REFERENCES diagnosticos(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  cuello_botella VARCHAR(50) NOT NULL,
  proximo_paso TEXT NOT NULL,
  benchmark TEXT NOT NULL,
  kpis_starter JSONB NOT NULL,
  modelo_usado VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resultados_diagnostico_id ON resultados(diagnostico_id);
