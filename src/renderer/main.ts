import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// Vuetify
import { createVuetify } from "vuetify";
import 'vuetify/styles';
import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

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
app.use(vuetify);
app.mount('#app');
