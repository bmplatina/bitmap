// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { en, ko } from "vuetify/locale";

const vuetify = createVuetify({
    locale: {
        locale: "ko",
        fallback: "en",
        messages: { ko, en },
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: { mdi },
    },
    theme: {
        defaultTheme: 'dark',
        themes: {
            light: {
                colors: {
                }
            },
            dark: {
                colors: {
                }
            }
        }
    },
    components,
    directives,
});

export default vuetify;
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
