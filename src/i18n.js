import Vue from "vue";
import VueI18n from "vue-i18n";
import ru from "./assets/lang/ru.json";

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: "ru",
  fallbackLocale: "ru",
  messages: {
    ru
  }
});

const loadedLanguages = ["ru"]; // default language is preloaded
export const availableLanguages = ["ru", "en"];

function checkLang(languageCode) {
  const [lang] = languageCode.split("-");
  if (availableLanguages.includes(lang)) {
    return lang;
  } else {
    return false;
  }
}

function detectBrowserLanguage() {
  const langs = navigator.languages || [navigator.language];

  for (const browserLang of langs) {
    const lang = checkLang(browserLang);
    if (lang) {
      return lang;
    }
  }

  return availableLanguages[0];
}

function getPreferredLanguage() {
  let lang = localStorage.getItem("urqwLang");

  if (!lang) {
    lang = detectBrowserLanguage();
    localStorage.setItem("urqwLang", lang);
  }

  return lang;
}

function setI18nLanguage(lang) {
  i18n.locale = lang;
  document.documentElement.setAttribute("lang", lang);
  return lang;
}

export async function loadLanguageAsync(lang) {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang) && availableLanguages.includes(lang)) {
      const msgs = await import(
        /* webpackChunkName: "lang-[request]" */ `@/assets/lang/${lang}`
      );
      i18n.setLocaleMessage(lang, msgs.default);
      loadedLanguages.push(lang);
      return setI18nLanguage(lang);
    }
    return setI18nLanguage(lang);
  }
  return lang;
}

const preferredLang = getPreferredLanguage();
loadLanguageAsync(preferredLang);
