"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getLanguageCode,
  getStoredLanguagePreference,
  subscribeToLanguagePreference,
  translateText,
  persistLanguagePreference,
  type SupportedLanguage,
} from "@/lib/language";

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  translate: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const textNodeState = new WeakMap<
  Text,
  { original: string; lastApplied: string | null }
>();
const elementOriginals = new WeakMap<
  Element,
  Partial<Record<"placeholder" | "title" | "aria-label", string>>
>();

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribeToLanguagePreference,
    getStoredLanguagePreference,
    () => "english",
  );

  useEffect(() => {
    document.documentElement.lang = getLanguageCode(language);
  }, [language]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.body;
    if (!root) {
      return;
    }

    const applyTranslations = () => {
      translateDomTree(root, language);
    };

    applyTranslations();

    const observer = new MutationObserver(() => {
      applyTranslations();
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  const value: LanguageContextValue = {
    language,
    setLanguage: (nextLanguage) => {
      if (nextLanguage !== language) {
        persistLanguagePreference(nextLanguage);
      }
    },
    translate: (text) => translateText(text, language),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}

function translateDomTree(root: HTMLElement, language: SupportedLanguage) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  );

  let currentNode = walker.currentNode;

  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      translateTextNode(currentNode as Text, language);
    }

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(currentNode as Element, language);
    }

    currentNode = walker.nextNode();
  }
}

function translateTextNode(node: Text, language: SupportedLanguage) {
  const parent = node.parentElement;
  const text = node.textContent ?? "";

  if (
    !parent ||
    !text.trim() ||
    parent.closest("[data-i18n-skip='true']") ||
    ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)
  ) {
    return;
  }

  const existingState = textNodeState.get(node);
  if (!existingState) {
    textNodeState.set(node, {
      original: text,
      lastApplied: null,
    });
  }

  const state = textNodeState.get(node) ?? {
    original: text,
    lastApplied: null,
  };

  // If React or async data changed the rendered text after our previous pass,
  // treat the new value as the source text instead of forcing the stale value back in.
  if (
    text !== state.original &&
    text !== state.lastApplied &&
    text.trim().length > 0
  ) {
    state.original = text;
  }

  const translated = translateTextPreservingWhitespace(state.original, language);

  if (translated !== node.textContent) {
    node.textContent = translated;
  }

  state.lastApplied = translated;
  textNodeState.set(node, state);
}

function translateElementAttributes(
  element: Element,
  language: SupportedLanguage,
) {
  const attributes = ["placeholder", "title", "aria-label"] as const;
  const originalEntry =
    elementOriginals.get(element) ??
    ({} as Partial<Record<(typeof attributes)[number], string>>);

  for (const attribute of attributes) {
    const currentValue = element.getAttribute(attribute);
    if (!currentValue) {
      continue;
    }

    if (!originalEntry[attribute]) {
      originalEntry[attribute] = currentValue;
    }

    const original = originalEntry[attribute] ?? currentValue;
    const translated = translateText(original, language);

    if (translated !== currentValue) {
      element.setAttribute(attribute, translated);
    }
  }

  elementOriginals.set(element, originalEntry);
}

function translateTextPreservingWhitespace(
  value: string,
  language: SupportedLanguage,
) {
  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  const translated = translateText(trimmed, language);
  if (translated === trimmed) {
    return value;
  }

  const prefixMatch = value.match(/^\s*/)?.[0] ?? "";
  const suffixMatch = value.match(/\s*$/)?.[0] ?? "";

  return `${prefixMatch}${translated}${suffixMatch}`;
}
