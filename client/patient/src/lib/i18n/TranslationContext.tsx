"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSessionStore } from '../../store/useSessionStore';

type TranslationCache = Record<string, Record<string, string>>;

interface TranslationContextType {
  t: (text: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Cache to prevent duplicate requests across components and re-renders
const globalTranslationCache: TranslationCache = {
  en: {} // Default language, no translation needed
};

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useSessionStore();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // If language is English, we don't need to translate
    if (!language || language === 'en') {
      setTranslations({});
      return;
    }

    if (!globalTranslationCache[language]) {
      globalTranslationCache[language] = {};
    }
    
    // Update local state with cached translations for the current language
    setTranslations({ ...globalTranslationCache[language] });
  }, [language]);

  const t = (text: string): string => {
    if (!text || !language || language === 'en') return text;

    // If we have it in cache, return it
    if (globalTranslationCache[language] && globalTranslationCache[language][text]) {
      return globalTranslationCache[language][text];
    }

    // Otherwise, we return the original text while fetching the translation in the background
    // To avoid infinite loops or multiple fetches for the same string, we mark it as 'fetching'
    if (!globalTranslationCache[language]) {
      globalTranslationCache[language] = {};
    }

    if (globalTranslationCache[language][text] !== undefined) {
      // Already fetching or translated
      return translations[text] || text;
    }

    // Mark as fetching with the original text temporarily
    globalTranslationCache[language][text] = text;

    // Fetch translation
    const fetchTranslation = async () => {
      try {
        const targetLang = language.includes('-') ? language : `${language}-IN`;
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: text,
            target_language_code: targetLang
          })
        });

        if (response.ok) {
          const data = await response.json();
          const translatedText = data.translated_text; // Sarvam returns translated_text
          if (translatedText) {
            globalTranslationCache[language][text] = translatedText;
            setTranslations(prev => ({ ...prev, [text]: translatedText }));
          }
        }
      } catch (error) {
        console.error('Translation error:', error);
      }
    };

    fetchTranslation();

    return text;
  };

  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
