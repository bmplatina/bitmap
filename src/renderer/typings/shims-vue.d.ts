import { App } from 'vue';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $filters: {
      formatDate: (value: string, locale: string) => string;
      getLanguage: () => string;
    };
    $t(key: string, ...params: unknown[]): string;
    $tc(key: string, choice?: number, ...params: unknown[]): string;
  }
  export interface GlobalComponents {
    LottieAnimation: typeof import('vue3-lottie')['Vue3Lottie']
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-i18n' {
  // Vue I18n 글로벌 속성 확장
  export interface DefineLocaleMessage {
    [key: string]: string | DefineLocaleMessage;
  }

  export interface VueI18n {
    $t: (key: string) => string;
    $tc: (key: string, choice?: number) => string;
  }
}