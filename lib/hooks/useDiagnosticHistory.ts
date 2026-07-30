import { useState, useEffect } from 'react';
import { DiagnosticoPorDispositivo } from '@/lib/api/device';
import { apiFetch } from '@/lib/api/clientFetch';

export function useDiagnosticHistory(deviceId: string | null) {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoPorDispositivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) {
      setIsLoading(false);
      return;
    }

    const fetchDiagnosticos = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/api/mini/device/${deviceId}/diagnosticos`);

        if (!response.ok) {
          throw new Error('Error al obtener historial');
        }

        const data = await response.json();
        setDiagnosticos(data.diagnosticos ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnosticos();
  }, [deviceId]);

  return { diagnosticos, isLoading, error };
}