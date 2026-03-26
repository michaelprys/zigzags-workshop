<script setup lang="ts">
import BaseBlackMarket from 'src/components/base/BaseBlackMarket.vue';
import BaseFeatured from 'src/components/base/BaseFeatured.vue';
import BaseIntro from 'src/components/base/BaseIntro.vue';
import { ref } from 'vue';

const model = ref('');
const suggestions = ref<{ label: string; value: string }[]>([]);

const filterFn = (val: string, doneFn: (callbackFn: () => void) => void, abortFn: () => void) => {
    if (val.length < 2) {
        abortFn();

        return;
    }
    doneFn(() => {});
};

const goToLink = (val: string) => {
    console.log('Go to:', val);
};
</script>

<template>
    <q-page>
        <BaseIntro
            v-model="model"
            :suggestions="suggestions"
            :filter-fn="filterFn"
            :go-to-link="goToLink" />
        <BaseFeatured />
        <BaseBlackMarket />
    </q-page>
</template>
