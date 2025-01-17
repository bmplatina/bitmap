<script setup lang="ts">
import { onMounted, ref } from "vue";

/*
 * General Settings
 */

// Screen Mode
import { useTheme } from "vuetify";
const theme = useTheme();

const screenMode = ref('');

const changeScreenMode = () => {
  console.log(screenMode.value);
  if(screenMode.value !== "auto") {
    theme.global.name.value = screenMode.value;
  }
  else {

  }
}

// Application Language
import { useLocale } from "vuetify";
import { useI18n } from "vue-i18n";

const { current } = useLocale();
const { locale, t } = useI18n();

const changeLanguage = () => {
  locale.value = selectedLanguage.value;
  current.value = selectedLanguage.value;
}

const selectedLanguage = ref<string>('');
const supportedLanguages = ref([
  { text: '한국어', value: 'ko' },
  { text: 'English', value: 'en' },
]);

onMounted(function () {
  selectedLanguage.value = locale.value;
  screenMode.value = theme.global.name.value;
  // window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  //   if(event.matches) screenMode.value = 'dark';
  // })
});
</script>

<template>
  <v-container fluid class="text-left">
<!--    General Settings-->
    <h1 class="primary-title">{{ t('settings-general') }}</h1>
    <v-card :title="t('screen-mode')" class="primary-card">
      <v-radio-group v-model="screenMode">
        <v-radio :label="t('screen-mode-dark')" value="dark" />
        <v-radio :label="t('screen-mode-light')" value="light" />
        <v-radio :label="t('screen-mode-system-default')" value="auto" />
      </v-radio-group>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn :text="t('apply')" @click="changeScreenMode()" />
      </v-card-actions>
    </v-card>
    <v-card title="언어 (Language)">
      <v-select v-model="selectedLanguage" :items="supportedLanguages" item-title="text" item-value="value" label="언어 (Language)" />
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn :text="t('apply')" @click="changeLanguage()" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
*:focus {
  outline: none;
}

.primary-title {
  margin-bottom: 25px;
}

.common-title {
  margin-bottom: 25px;
  margin-top: 25px;
}

.primary-card {
  margin-bottom: 15px;
}

.common-card {
  margin-bottom: 10px;
  margin-top: 10px;
}
</style>