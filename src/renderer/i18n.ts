import { createI18n } from "vue-i18n";

// Import Localization table
import ko from "./locales/ko.json";
import en from "./locales/en.json";

const osLocale = await window.electronAPI.getLocale();
console.log("TargetLanguage: ", osLocale);

const messages = {
    en,
    ko,
};

const i18n = createI18n({
    locale: osLocale,
    fallbackLng: "en",
    messages,
});

export default i18n;