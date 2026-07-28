CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facturacion_mensual_cop BIGINT NOT NULL,
  anios_operacion INT NOT NULL,
  rol VARCHAR(50) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  califica BOOLEAN NOT NULL DEFAULT false,
  estado VARCHAR(50) NOT NULL DEFAULT 'nuevo',
  auth_user_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_auth_user_id ON leads(auth_user_id);
CREATE INDEX idx_leads_califica ON leads(califica);