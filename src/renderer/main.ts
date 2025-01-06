import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// Vuetify
import { createVuetify } from "vuetify";
import 'vuetify/styles';
import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Date
import dayjs from "dayjs";

// i18n
import i18n from "./i18n";
import { useI18n } from "vue-i18n";

// Lottie
import Vue3Lottie from 'vue3-lottie';

const vuetify = createVuetify({
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
                    primary: '#6200EE',
                    secondary: '#03DAC6',
                }
            }
        }
    },
    components,
    directives,
});

const app = createApp(App);

app.config.globalProperties.$filters = {
    formatDate(value: string, locale: string) {
        return locale === 'ko'
            ? dayjs(value).format('YYYY/MM/DD')
            : dayjs(value).format('MM/DD/YYYY');
    },
    getLanguage(): string {
        return useI18n().locale.value;
    },
};

app.use(vuetify);
app.use(i18n);
app.use(Vue3Lottie, { name: "LottieAnimation"});
app.mount('#app');
