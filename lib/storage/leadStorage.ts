const STORAGE_KEY = 'reactia_lead';

export type StoredLead = {
  leadId: string;
  deviceId: string;
  nombre: string;
  empresa: string;
  whatsapp: string;
};

// Cachea el último valor parseado para que getLead() devuelva la misma
// referencia mientras el localStorage no cambie — lo requiere useLead()
// (useSyncExternalStore) para no entrar en un loop de renders infinito.
let cachedRaw: string | null = null;
let cachedLead: StoredLead | null = null;

export const saveLead = (lead: StoredLead): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
    // Invalida la caché: si no, getLead() seguiría devolviendo el lead anterior
    // hasta que cambiara el raw.
    cachedRaw = null;
    cachedLead = null;
  } catch {
    // localStorage no disponible (SSR u otro contexto)
  }
};

export const getLead = (): StoredLead | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === cachedRaw) {
      return cachedLead;
    }

    cachedRaw = raw;

    if (!raw) {
      cachedLead = null;
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredLead>;
    if (!parsed.leadId) {
      cachedLead = null;
      return null;
    }

    // `empresa` se agregó después del lanzamiento — un lead guardado por la
    // versión anterior no la tiene, y eso no debe romper el flujo.
    // `deviceId` se agregó posteriormente — un lead guardado por versión
    // anterior no lo tiene.
    cachedLead = {
      leadId: parsed.leadId,
      deviceId: parsed.deviceId ?? '',
      nombre: parsed.nombre ?? '',
      empresa: parsed.empresa ?? '',
      whatsapp: parsed.whatsapp ?? '',
    };
    return cachedLead;
  } catch {
    return null;
  }
};

export const clearLead = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    cachedRaw = null;
    cachedLead = null;
  } catch {
    // localStorage no disponible (SSR u otro contexto)
  }
};
