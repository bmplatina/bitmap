<script setup lang="ts">
import { ref, onMounted } from "vue";

const username = ref("");

onMounted(function () {
  window.electronAPI.getCookies('overwikiUserName').then((res) => {
    username.value = res;
  });
})
</script>

<template>
  Hello, {{ username }}!
</template>

<style scoped>

</style>