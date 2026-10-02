import { getDB } from '../db';
import { AppSettings } from '../../types';
import { DEFAULT_SETTINGS } from '../seed/seedData';

const SETTINGS_KEY = 'app_config';

export const settingsRepository = {
  async get(): Promise<AppSettings> {
    const db = await getDB();
    const config = await db.get('settings', SETTINGS_KEY);
    return config ? { ...DEFAULT_SETTINGS, ...config } : DEFAULT_SETTINGS;
  },

  async update(settings: Partial<AppSettings>): Promise<AppSettings> {
    const db = await getDB();
    const current = await this.get();
    const updated = { ...current, ...settings };
    await db.put('settings', updated, SETTINGS_KEY);
    return updated;
  },
};
