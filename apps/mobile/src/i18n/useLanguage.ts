import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languageReady, selectLanguage, type AppLanguage } from './i18n';

export type { AppLanguage } from './i18n';

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ' },
] as const;

export function useLanguage() {
  const { i18n } = useTranslation();
  const language: AppLanguage = i18n.language === 'am' ? 'am' : 'en';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void languageReady.then(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    language,
    changeLanguage: selectLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    loading,
  };
}
