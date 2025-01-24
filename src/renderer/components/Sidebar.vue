<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

router.push("/games");

const bIsLoggedIn = ref(false);
const bIsSignInModalOpened = ref(false);

const username = ref('');
const email = ref('');
const password = ref('');
const bShowPassword = ref(false);
const bIsTermsAgreed = ref(false);
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
    }
    else {
      console.error("로그인 실패:", result.error);
    }
  }
  catch (error) {
    console.error("IPC 로그인 요청 실패:", error);
  }
}

async function createAccount() {
  const apiUrl = "https://wiki.prodbybitmap.com/w/api.php";

  // 1. CSRF 토큰 가져오기
  const tokenRes = await fetch(`${apiUrl}?action=query&meta=tokens&type=createaccount&format=json`, {
    method: "GET",
    credentials: "include", // 쿠키 필요 시
    headers: {
      "Content-Type": "application/json",
    },
  });

  const tokenData = await tokenRes.json();
  const csrfToken = tokenData?.query?.tokens?.createaccounttoken;

  if (!csrfToken) {
    throw new Error("CSRF 토큰을 가져올 수 없습니다.");
  }

  // 2. 계정 생성 요청
  const accountRes = await fetch(apiUrl, {
    method: "POST",
    credentials: "include", // 쿠키 필요 시
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      action: "createaccount",
      format: "json",
      username: username.value,
      password: password.value,
      retype: password.value,
      email: email.value,
      createreturnurl: "https://wiki.prodbybitmap.com/",
      token: csrfToken,
    }),
  });

  const accountData = await accountRes.json();

  if (accountData?.createaccount?.status === "PASS") {
    console.log("계정이 성공적으로 생성되었습니다:", accountData.createaccount.username);
  } else {
    console.error("계정 생성 실패:", accountData);
  }
}

</script>

<template>
<!--  <v-navigation-drawer v-model="props.bIsOpened" temporary :location="$vuetify.display.mobile ? 'bottom' : undefined">-->
  <v-navigation-drawer
      expand-on-hover
      rail
  >
    <v-list class="text-left">
      <v-list-item link :title="$t('home')" prepend-icon="mdi-home" @click="router.push('/')" disabled />
      <v-divider />
      <v-list-item link :title="$t('games')" prepend-icon="mdi-gamepad" @click="router.push('/games')" />
      <v-list-item link :title="$t('game-submit')" prepend-icon="mdi-form-select" @click="router.push('/games/submit')" />
      <v-list-item link :title="$t('games-pending')" prepend-icon="mdi-account-clock-outline" @click="router.push('/games/pending')" />
      <v-divider />
      <v-list-item link :title="$t('accounts')" prepend-icon="mdi-account" @click="bIsLoggedIn ? router.push('/accounts') : bIsSignInModalOpened = true" />
      <v-list-item link :title="$t('settings')" prepend-icon="mdi-cog" @click="router.push('/settings')" />
    </v-list>
  </v-navigation-drawer>

  <v-dialog v-model="bIsSignInModalOpened">
    <v-card
        :title="t('login')"
        class="mx-auto pa-12 pb-8"
        elevation="8"
        max-width="448"
        rounded="lg">
      <div class="text-subtitle-1 text-medium-emphasis">{{ t('id') }}</div>
      <v-text-field
          v-model="username"
          clearable
          density="compact"
          :label="$t('id')" />
      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        {{ t('password') }}
        <a
            class="text-caption text-decoration-none text-blue"
            href="#"
            rel="noopener noreferrer"
            target="_blank"
        >
          Forgot login password?</a>
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
          @click:append="bShowPassword = !bShowPassword" />
      <v-card
          class="mb-12"
          color="surface-variant"
          variant="tonal"
      >
        <v-card-text class="text-medium-emphasis text-caption">
          Warning: After 3 consecutive failed login attempts, you account will be temporarily locked for three hours. If you must login now, you can also click "Forgot login password?" below to reset the login password.
        </v-card-text>
      </v-card>
      <v-btn
          class="mb-8"
          color="blue"
          size="large"
          variant="tonal"
          block
          @click="login(username, password)"
      >
        {{ t('login') }}
      </v-btn>

      <v-card-text class="text-center">
        <a
            class="text-blue text-decoration-none"
            href="#"
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