import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// Vuetify
import vuetify from "./plugins/vuetify";

// Date
import dayjs from "dayjs";

// i18n
import { i18n, useI18n } from "./plugins/i18n/i18n";

// Lottie
import Vue3Lottie from 'vue3-lottie';

// vue-router
import router from "./router";

// webfont
import { loadFonts } from "./plugins/webfontloader";

// Store
import store from "./plugins/store";

loadFonts();

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

app.use(router).use(vuetify).use(i18n).use(Vue3Lottie, { name: "LottieAnimation"}).use(store).mount('#app');
