import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import am from './am.json';
import accountEntryEn from './accountEntry.en.json';
import accountEntryAm from './accountEntry.am.json';
import authScreensEn from './authScreens.en.json';
import authScreensAm from './authScreens.am.json';
import authResultsEn from './authResults.en.json';
import authResultsAm from './authResults.am.json';

export type AppLanguage = 'en' | 'am';
const LANGUAGE_KEY = 'sundayseeds_language';
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
const supportedLanguage = deviceLanguage === 'am' ? 'am' : 'en';

const initialized = i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        ...en,
        accountEntry: accountEntryEn,
        authScreens: authScreensEn,
        authResults: authResultsEn,
      },
    },
    am: {
      translation: {
        ...am,
        accountEntry: accountEntryAm,
        authScreens: authScreensAm,
        authResults: authResultsAm,
      },
    },
  },
  lng: supportedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

// Hydrate once for every entry point, including standalone email links.
export const languageReady = initialized
  .then(() => AsyncStorage.getItem(LANGUAGE_KEY))
  .then(async (saved) => {
    if ((saved === 'am' || saved === 'en') && saved !== i18n.language) {
      await i18n.changeLanguage(saved);
    }
  })
  .catch(() => {
    // Keep the device default when preference storage is unavailable.
  });

let pendingLanguageWrite = Promise.resolve();

export async function selectLanguage(language: AppLanguage) {
  await languageReady;
  await i18n.changeLanguage(language);
  // Serialize writes so rapid switches restore the latest choice next launch.
  pendingLanguageWrite = pendingLanguageWrite
    .then(() => AsyncStorage.setItem(LANGUAGE_KEY, language))
    .catch(() => {
      // An unavailable store does not undo the in-session choice.
    });
  await pendingLanguageWrite;
}

export default i18n;
