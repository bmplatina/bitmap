<script setup lang="ts">
const props = defineProps<{
  bIsOpened: boolean,
}>();

</script>

<template>
  <v-navigation-drawer v-model="props.bIsOpened" temporary  :location="$vuetify.display.mobile ? 'bottom' : undefined">
    <v-list class="text-left">
      <v-list-item link :title="$t('home')" prepend-icon="mdi-home" @click="$router.push('/')" />
      <v-divider />
      <v-list-item link :title="$t('games')" prepend-icon="mdi-gamepad" @click="$router.push('/games')" />
      <v-list-item link :title="$t('game-submit')" prepend-icon="mdi-form-select" @click="$router.push('/games/submit')" />
      <v-list-item link :title="$t('games-pending')" prepend-icon="mdi-account-clock-outline" @click="$router.push('/games/pending')" />
      <v-divider />
      <v-list-item link :title="$t('accounts')" prepend-icon="mdi-account" @click="$router.push('/')" disabled />
      <v-list-item link :title="$t('settings')" prepend-icon="mdi-cog" @click="$router.push('/')" disabled />
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>

</style>