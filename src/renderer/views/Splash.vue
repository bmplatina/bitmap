<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Vue3Lottie } from "vue3-lottie";
import BitmapIntro from "../assets/lottie_BitmapBaseIntro.json";

const bIsVisible = ref<boolean>(true);

onMounted(() => {
  setTimeout(() => {
    bIsVisible.value = false;
  })
});
</script>

<template>
  <div v-if="bIsVisible" class="splash-screen">
    <Vue3Lottie
        :animationData="BitmapIntro"
        :loop="false"
    />
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  transition: transform 1s ease-out, opacity 1s ease-out; /* 애니메이션 설정 */
}

.splash-screen img {
  max-width: 80%;
  max-height: 80%;
}

.splash-screen.fade-out {
  transform: translateY(100%); /* 이미지가 아래로 내려가게 설정 */
  opacity: 0; /* 사라지게 설정 */
}
</style>