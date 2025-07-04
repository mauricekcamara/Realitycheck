import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GamblingSession, DebtInfo } from '../types';

const SESSIONS_KEY = 'gambling_sessions';
const DEBT_KEY = 'debt_info';
const SETTINGS_KEY = 'user_settings';

export interface UserSettings {
  currency: string;
  notifications: boolean;
  theme: 'light' | 'dark';
}

export function useDataStorage() {
  const [sessions, setSessions] = useState<GamblingSession[]>([]);
  const [debtInfo, setDebtInfo] = useState<DebtInfo | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'USD',
    notifications: true,
    theme: 'dark'
  });
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, debtData, settingsData] = await Promise.all([
        SecureStore.getItemAsync(SESSIONS_KEY),
        SecureStore.getItemAsync(DEBT_KEY),
        SecureStore.getItemAsync(SETTINGS_KEY)
      ]);

      if (sessionsData) {
        const parsedSessions = JSON.parse(sessionsData).map((session: any) => ({
          ...session,
          date: new Date(session.date)
        }));
        setSessions(parsedSessions);
      }

      if (debtData) {
        const parsedDebt = JSON.parse(debtData);
        setDebtInfo({
          ...parsedDebt,
          originalPayoffDate: new Date(parsedDebt.originalPayoffDate),
          currentPayoffDate: new Date(parsedDebt.currentPayoffDate)
        });
      }

      if (settingsData) {
        setSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSessions = async (newSessions: GamblingSession[]) => {
    try {
      await SecureStore.setItemAsync(SESSIONS_KEY, JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  };

  const addSession = async (session: Omit<GamblingSession, 'id'>) => {
    const newSession: GamblingSession = {
      ...session,
      id: Date.now().toString()
    };
    const newSessions = [...sessions, newSession];
    await saveSessions(newSessions);
  };

  const updateSession = async (id: string, updates: Partial<GamblingSession>) => {
    const newSessions = sessions.map(session =>
      session.id === id ? { ...session, ...updates } : session
    );
    await saveSessions(newSessions);
  };

  const deleteSession = async (id: string) => {
    const newSessions = sessions.filter(session => session.id !== id);
    await saveSessions(newSessions);
  };

  const saveDebtInfo = async (debt: DebtInfo) => {
    try {
      await SecureStore.setItemAsync(DEBT_KEY, JSON.stringify(debt));
      setDebtInfo(debt);
    } catch (error) {
      console.error('Error saving debt info:', error);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const clearAllData = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(SESSIONS_KEY),
        SecureStore.deleteItemAsync(DEBT_KEY),
        SecureStore.deleteItemAsync(SETTINGS_KEY)
      ]);
      setSessions([]);
      setDebtInfo(null);
      setSettings({
        currency: 'USD',
        notifications: true,
        theme: 'dark'
      });
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return {
    sessions,
    debtInfo,
    settings,
    loading,
    addSession,
    updateSession,
    deleteSession,
    saveDebtInfo,
    saveSettings,
    clearAllData
  };
} 