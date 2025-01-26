<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "../plugins/store";
import { storeToRefs } from "pinia";

const router = useRouter();
const authStore = useAuthStore();
const { userName, userId, bIsLoggedIn } = storeToRefs(authStore);
const { t } = useI18n();

async function logout() {
  try {
    const result = await window.electronAPI.logout();
    if (result.success) {
      console.log("로그아웃 성공, ", result.logoutData);
      bIsLoggedIn.value = false;
      await router.push('/');
    }
    else {
      console.error("로그아웃 실패: ", result.error);
    }
  }
  catch (error) {
    console.error("IPC 로그인 요청 실패:", error);
  }
}

onMounted(function () {
})
</script>

<template>
  Hello, {{ userName }}!
  <v-btn @click="logout"> {{ t('logout') }} </v-btn>

</template>

<style scoped>
*:focus {
  outline: none;
}
</style>