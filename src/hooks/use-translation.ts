import { useCallback } from 'react';
import ja from '../locales/ja.json';

type TranslationKey = keyof typeof ja;

// Function to provide translations based on the current locale
function useTranslation() {
  const t = useCallback(
    (key: TranslationKey): string => {
      return ja[key] || key;
    },
    []
  );

  return { t };
}

export default useTranslation;
