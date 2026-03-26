<script setup lang="ts">
import ItemScrollTop from 'src/components/items/ItemScrollTop.vue';
import ItemDrawer from 'src/components/items/ItemDrawer.vue';
import MainFooter from 'components/layout/MainFooter.vue';
import MainHeader from 'components/layout/MainHeader.vue';
import { ref } from 'vue';

const drawer = ref(false);
</script>

<template>
    <q-layout view="lhh LpR lff">
        <div class="bg"></div>
        <MainHeader @toggle-drawer="drawer = !drawer" />
        <MainFooter />
        <Teleport to="body">
            <ItemDrawer v-model="drawer" />
        </Teleport>
        <q-page-container>
            <Teleport to="body">
                <ItemScrollTop />
            </Teleport>
            <RouterView #="{ Component }">
                <Transition name="fade" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </q-page-container>
    </q-layout>
</template>
