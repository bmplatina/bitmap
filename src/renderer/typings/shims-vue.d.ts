import { App } from 'vue';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $filters: {
      formatDate: (value: string, locale: string) => string;
    };
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}
