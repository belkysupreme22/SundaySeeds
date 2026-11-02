import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../../i18n/i18n';

const LANGUAGE_KEY = 'sundayseeds_language';

export type AppLanguage = 'en' | 'am';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ' },
];

export function useLanguage() {
  const [language, setLanguage] = useState<AppLanguage>(
    (i18n.language as AppLanguage) ?? 'en',
  );
  const [loading, setLoading] = useState(true);

  // Hydrate from storage once on mount
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((stored) => {
        const lang = stored === 'am' || stored === 'en' ? stored : null;
        if (lang && lang !== i18n.language) {
          void i18n.changeLanguage(lang);
          setLanguage(lang);
        } else {
          setLanguage((i18n.language as AppLanguage) ?? 'en');
        }
      })
      .catch(() => {
        // Storage unavailable — keep device default
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const changeLanguage = useCallback(async (lang: AppLanguage) => {
    try {
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguage(lang);
    } catch {
      // Persist failure is non-fatal — language still changes in-session
    }
  }, []);

  return { language, changeLanguage, availableLanguages: AVAILABLE_LANGUAGES, loading };
}
