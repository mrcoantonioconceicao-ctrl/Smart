import React, { createContext, useContext, useState } from "react";
import { Language, ViewMode, translations } from "../utils/i18n";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  t: typeof translations["pt"];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = sessionStorage.getItem("solana_devsecops_lang");
    return (saved as Language) || "pt";
  });

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = sessionStorage.getItem("solana_devsecops_viewmode");
    return (saved as ViewMode) || "simple";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    sessionStorage.setItem("solana_devsecops_lang", lang);
  };

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    sessionStorage.setItem("solana_devsecops_viewmode", mode);
  };

  const t = translations[language] || translations.pt;

  return (
    <AppContext.Provider value={{ language, setLanguage, viewMode, setViewMode, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppConfig must be used within an AppProvider");
  }
  return context;
};
