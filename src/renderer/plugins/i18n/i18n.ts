import { createI18n, useI18n } from "vue-i18n";

// Import Localization table
import ko from "./ko.json";
import en from "./en.json";

const osLocale = navigator.language.split('-')[0];
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

export { i18n, useI18n };