import { useCallback } from 'react';
import ja from '../locales/ja.json';

type TranslationKey = keyof typeof ja;

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
