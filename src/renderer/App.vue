<script setup lang="ts">
import {onMounted, ref} from "vue";

// Lottie
import { Vue3Lottie } from "vue3-lottie";
import BitmapIntro from "./assets/lottie_BitmapBaseIntro.json";

// Locale
import { useI18n } from "vue-i18n";
import { useLocale } from "vuetify";

// Components
import Sidebar from "./components/Sidebar.vue";
import TrafficButtons from "./components/TrafficButtons.vue";

const { current } = useLocale();
const { locale, t } = useI18n();

const changeLanguage = (newLocale: string) => {
  if(newLocale === 'ko' || newLocale === 'en') {
    locale.value = newLocale;
  }
}

const toggleLanguage = () => {
  if(locale.value === 'ko') {
    locale.value = 'en';
    current.value = 'en';
  }
  else if(locale.value === 'en') {
    locale.value = 'ko';
    current.value = 'ko';
  }
};

const bIsSidebarOpened = ref(false);
const toggleSidebarOpenState = () => {
  bIsSidebarOpened.value = !bIsSidebarOpened.value;
};

/*
 * Check platform
 */
const CurrentPlatform = ref<string>("");

async function GetPlatform() {
  try {
    CurrentPlatform.value = await window.electronAPI.getPlatform();
  }
  catch (error) {
    console.error(error);
  }
}

window.electronAPI.sendMessage('Hello from App.vue!');

onMounted(function () {
  GetPlatform();
})
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark fixed density="compact" class="text-left" style="-webkit-app-region: drag;">
<!--      <v-app-bar-nav-icon @click="toggleSidebarOpenState()" style="-webkit-app-region: no-drag; margin-left: 70px" />-->
      <TrafficButtons v-if="CurrentPlatform === 'win32'" />
      <v-toolbar-title class="bitmap-title">{{ $t('bitmap') }}</v-toolbar-title>
      <!-- 우측에 추가메뉴 아이콘을 넣기 위해 v-spacer 엘리먼트 사용 -->
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleLanguage()" style="-webkit-app-region: no-drag;">
        {{ $filters.getLanguage() }}
        <!--          <v-icon>mdi-dots-vertical</v-icon>-->
      </v-btn>
    </v-app-bar>

    <v-main fill-width>
      <Sidebar :bIsOpened="bIsSidebarOpened" />
      <router-view />
      <!--        <Vue3Lottie-->
      <!--            :animationData="BitmapIntro"-->
      <!--            :height="200"-->
      <!--            :width="200"-->
      <!--            :loop="false"-->
      <!--        />-->
    </v-main>
  </v-app>
</template>

<style scoped>
*:focus {
  outline: none;
}
</style>

<!-- eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzM1NzMyNDUxLCJleHAiOjE4MzA0MDUyNTEsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.Gcb40HCT8mubVZgU8GCFM9k2fL-dO6cBNkCgcwdfhMQxS1HVL-_aRqZwSGtQz1hXNd_OmP7M7XjDSLTrucLuTj2TVjTsYbaPbLOOEm1_zG71itGctn5RM5caoujMDtNIqf9OReU0VdCpfMefoOtFnozZ-pDqN8dxKW7uovwpRfssmzsTl6uOfcjTJWitllY-L8prngkmOsquO2dr4ZCokWwyyzG4cl3pXVrHF1y-tL-JQSEXwuaUewu0vKWDUimT6IbDqfplOS9V3STBeWuQo05Zz-SLmW9C9kNgKaNKA18SeTeot3_xKwCHfnE01MwwLM0nslDkgoSFX59I3B9rig -->