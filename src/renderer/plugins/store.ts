import { defineStore } from 'pinia'
import { computed, ref } from "vue";

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

const useAuthStore = defineStore("auth", function() {
    // Properties
    const userName = ref<string>('');
    const userId = ref<number>(0);
    const bIsLoggedIn = ref<boolean>(false);

    // Getter
    const getUserName = computed(() => userName.value);
    const getUserId = computed(() => userId.value);
    const getIsLoggedIn = computed(() => bIsLoggedIn.value);

    // Setter
    function setUserName(newUserName: string) {
        userName.value = newUserName;
    }

    function setUserId(newUserId: number) {
        userId.value = newUserId;
    }

    function setIsLoggedIn(inLoggedInState: boolean) {
        bIsLoggedIn.value = inLoggedInState;
    }


    return {
        userName,
        userId,
        bIsLoggedIn,
        getUserName,
        getUserId,
        getIsLoggedIn,
        setUserName,
        setUserId,
        setIsLoggedIn,
    };
});

export { useInstallationStore, useAuthStore };