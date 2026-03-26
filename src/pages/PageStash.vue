<script setup lang="ts">
import StashDialog from 'src/components/stash/StashDialog.vue';
import StashEmpty from 'src/components/stash/StashEmpty.vue';
import StashItems from 'src/components/stash/StashItems.vue';
import { useStoreGoods } from 'stores/goods.store';
import { ref } from 'vue';

const storeGoods = useStoreGoods();
const dialog = ref(false);
</script>

<template>
    <q-page>
        <StashDialog v-model="dialog" />
        <Transition name="fade">
            <StashItems v-if="storeGoods.stashGoods.length > 0" @open-dialog="dialog = true" />
            <StashEmpty v-else />
        </Transition>
    </q-page>
</template>
