import { useSessionStore } from '../store/useSessionStore';
import type { LangId } from './languages';
import en from './en.json';
import hi from './hi.json';
import bn from './bn.json';
import ta from './ta.json';
import mr from './mr.json';

type Catalog = Record<string, string>;

// English is the source/base catalog: every key exists here, and any missing
// key in another language falls back to it. bn/ta/mr start as thin stubs.
const CATALOGS: Record<LangId, Catalog> = {
  en: en as Catalog,
  hi: hi as Catalog,
  bn: bn as Catalog,
  ta: ta as Catalog,
  mr: mr as Catalog,
};

const BASE: Catalog = en as Catalog;

export type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

/**
 * Core lookup. Resolves `key` in the given language, falling back to English,
 * then to the key itself (so a missing string is visible in dev, never blank).
 */
export function translate(lang: string, key: string, vars?: Vars): string {
  const cat = CATALOGS[lang as LangId] ?? BASE;
  const raw = cat[key] ?? BASE[key] ?? key;
  return interpolate(raw, vars);
}

export type TFn = (key: string, vars?: Vars) => string;

/**
 * Hook for components: returns a `t()` bound to the currently-selected
 * language. Re-renders when the language changes (zustand subscription).
 */
export function useT(): { t: TFn; language: LangId } {
  const language = useSessionStore((s) => s.language) as LangId;
  const t: TFn = (key, vars) => translate(language, key, vars);
  return { t, language };
}
