<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useAuthStore } from "../plugins/store";
import { storeToRefs } from "pinia";
import {Game} from "../types/GameList";

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const { userName, userId, bIsLoggedIn } = storeToRefs(authStore);

const bIsSignInModalOpened = ref(false);
const bIsRegistering = ref(false);

const username = ref('');
const email = ref('');
const password = ref('');
const bShowPassword = ref(false);
const bIsTermsAgreed = ref(false);

const authFailedReasons = reactive({
  bIsFailed: false,
  result: '',
  reason: '',
});

const passwordRules = {
  required: (value: string) => !!value || 'Required.',
  min: (v: string) => v.length >= 8 || t('password-rules'),
  emailMatch: () => `The email and password you entered don't match`,
};

async function login(username: string, password: string) {
  try {
    const result = await window.electronAPI.login(username, password);
    if (result.success) {
      console.log("로그인 성공:", result.username);
      bIsLoggedIn.value = true;

      // 유저 이름 저장
      window.electronAPI.getCookies('overwikiUserName').then((res) => {
        userName.value = res;
        console.log(userName);
      });

      // 유저 ID 번호 저장
      window.electronAPI.getCookies('overwikiUserId').then((res) => {
        userId.value = Number(res);
        console.log(userId);
      });

      bIsSignInModalOpened.value = false;
      authFailedReasons.bIsFailed = false;
    }
    else {
      console.error("로그인 실패:", result.error);
      bIsLoggedIn.value = false;
      authFailedReasons.bIsFailed = true;
      authFailedReasons.result = result.error.login.result;
      authFailedReasons.reason = result.error.login.reason;
    }
  }
  catch (error) {
    console.error("IPC 로그인 요청 실패:", error);
  }
}

async function createAccount(username: string, email: string, password: string) {
  try {
    const result = await window.electronAPI.register(username, email, password);
    if (result) {
      console.log("로그인 성공");
      await login(username, password);
    }
    else {
      console.error("로그인 실패");
      bIsLoggedIn.value = false;
    }
  }
  catch (error) {
    console.error("IPC 로그인 요청 실패:", error);
  }
}

onMounted(() => {
  window.electronAPI.getCookies('overwikiToken').then((res) => {
    bIsLoggedIn.value = res.length > 5;
  });
  window.electronAPI.getCookies('overwikiUserName').then((res) => {
    userName.value = res;
  });
});
</script>

<template>
  <v-navigation-drawer
      expand-on-hover
      rail
  >
    <v-list class="text-left">
      <v-list-item link :title="t('home')" prepend-icon="mdi-home" @click="router.push('/')" />
      <v-divider />
      <v-list-item link :title="t('games')" prepend-icon="mdi-gamepad" @click="router.push('/games')" />
      <v-list-item link :title="t('game-submit')" prepend-icon="mdi-form-select" @click="bIsLoggedIn ? router.push('/games/submit') : bIsSignInModalOpened = true" />
      <v-list-item link :title="t('games-pending')" prepend-icon="mdi-account-clock-outline" @click="router.push('/games/pending')" />
      <v-divider />
      <v-list-item v-if="bIsLoggedIn" link :title="t('accounts')" prepend-icon="mdi-account" @click="router.push('/accounts')" />
      <v-list-item v-else link :title="t('login')" prepend-icon="mdi-login" @click="bIsSignInModalOpened = true" />
      <v-list-item link :title="t('settings')" prepend-icon="mdi-cog" @click="router.push('/settings')" />
    </v-list>
  </v-navigation-drawer>

  <v-dialog v-model="bIsSignInModalOpened" max-width="448">
    <v-card
        title="Bitmap ID"
        class="mx-auto pa-12 pb-8"
        elevation="8"
        rounded="lg">
      <div class="text-subtitle-1 text-medium-emphasis">{{ t('id') }}</div>
      <v-text-field
          v-model="username"
          clearable
          density="compact"
          :label="$t('id')"
          @keyup.enter="login(username, password)" />
      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        {{ t('password') }}
        <a
            class="text-caption text-decoration-none text-blue"
            href="https://wiki.prodbybitmap.com/wiki/특수:비밀번호재설정"
            rel="noopener noreferrer"
            target="_blank"
        >
          {{ t('forgot-password') }}</a>
      </div>
      <v-text-field
          v-model="password"
          :label="$t('password')"
          density="compact"
          clearable
          :append-icon="bShowPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[passwordRules.required, passwordRules.min]"
          :type="bShowPassword ? 'text' : 'password'"
          :hint="t('password-rules')"
          name="input-10-1"
          counter
          @click:append="bShowPassword = !bShowPassword"
          @keyup.enter="login(username, password)" />
      <v-card
          class="mb-12"
          color="surface-variant"
          variant="tonal"
      >
        <v-card>
          <v-card-title>
            {{ authFailedReasons.bIsFailed ? t(authFailedReasons.result) : t('before-continuing') }}
          </v-card-title>
          <v-card-text class="text-medium-emphasis text-caption">
            {{ authFailedReasons.bIsFailed ? t(authFailedReasons.reason) : t('login-notification') }}
          </v-card-text>
        </v-card>
      </v-card>
      <v-btn
          class="mb-8"
          color="blue"
          size="large"
          variant="tonal"
          block
          @click="login(username, password)"
          prepend-icon="mdi-login"
      >
        {{ t('login') }}
      </v-btn>

      <v-card-text class="text-center">
        <a
            class="text-blue text-decoration-none"
            href="//wiki.prodbybitmap.com/w/index.php?title=특수:계정만들기"
            rel="noopener noreferrer"
            target="_blank"
        >
          {{ t('register') }} <v-icon icon="mdi-chevron-right" />
        </a>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>