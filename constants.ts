
import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  channelId: '3205334',
  readApiKey: 'F1QQTII84R0NG0FX',
  writeApiKey: '',
  refreshInterval: 15,
  thresholds: {
    bpm: { min: 60, max: 100 },
    spo2: { min: 95 },
    temp: { min: 36.0, max: 37.5 },
  },
};

export const STORAGE_KEYS = {
  SETTINGS: 'vitalshield_settings',
  USER: 'vitalshield_user_session',
  USERS_DB: 'vitalshield_registered_users',
};
