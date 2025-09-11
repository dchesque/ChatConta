import { useState, useEffect, useCallback } from 'react';
import { Settings, SettingsUpdateData } from '@/types/settings';
import { SettingsService } from '@/services/settingsService';
import { showMessage } from '@/utils/messages';

export function useSettings() {
  const [data, setData] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const settings = await SettingsService.get();
      setData(settings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar configurações';
      setError(message);
      showMessage.saveError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (patch: SettingsUpdateData) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      const promise = SettingsService.upsert(patch);
      
      await showMessage.promise(promise, {
        loading: 'Salvando configurações...',
        success: 'Configurações salvas com sucesso!',
        error: 'Erro ao salvar configurações'
      });

      const updated = await promise;
      setData(updated);
      setIsDirty(false);

      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  const resetToDefault = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      const promise = SettingsService.resetToDefault();
      
      await showMessage.promise(promise, {
        loading: 'Restaurando configurações...',
        success: 'Configurações restauradas aos padrões!',
        error: 'Erro ao restaurar configurações'
      });

      const restored = await promise;
      setData(restored);
      setIsDirty(false);

      return restored;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao restaurar';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  const updateLocal = useCallback((patch: SettingsUpdateData) => {
    if (!data) return;
    
    const updated = { 
      ...data, 
      ...patch,
      notifications: patch.notifications ? { ...data.notifications, ...patch.notifications } : data.notifications
    };
    setData(updated);
    setIsDirty(true);
  }, [data]);

  const refresh = useCallback(() => {
    SettingsService.clearCache();
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    data,
    isLoading,
    isSaving,
    error,
    isDirty,
    save,
    resetToDefault,
    updateLocal,
    refresh
  };
}