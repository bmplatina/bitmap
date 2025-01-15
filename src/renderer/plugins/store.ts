import { defineStore } from 'pinia'

const useInstallationStore = defineStore('installation', {
    state: () => ({
        downloadProgress: 0.0,
        extractProgress: 0.0,
    }),
    getters: {
        getDownloadProgress: (state) => state.downloadProgress,
        getExtractProgress: (state) => state.extractProgress,
    },
    // 상태값을 바꾸고 싶을 떄!
    // 여기서 this 쓰는거 유의하기!
    actions: {
        resetDownloadProgress() {
            this.downloadProgress = 0.0;
        },
        resetExtractProgress() {
            this.extractProgress = 0.0;
        },
        setDownloadProgress(newProgress: number) {
            this.downloadProgress = newProgress;
        },
        setExtractProgress(newProgress: number) {
            this.extractProgress = newProgress;
        }
    },
});

export { useInstallationStore };