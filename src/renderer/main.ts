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
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate';

import { createManager } from '@vue-youtube/core';

loadFonts();

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPersist);

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

app
    .use(router)
    .use(vuetify)
    .use(i18n)
    .use(Vue3Lottie, {
        name: "LottieAnimation"
    })
    .use(pinia)
    .use(createManager())
    .mount('#app');
