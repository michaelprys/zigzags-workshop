<script setup lang="ts">
defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);
const menuList = [
    { label: 'Base', route: 'base' },
    { label: 'Guide', route: 'guide' },
    { label: 'Vault', route: 'vault' },
    { label: 'Workshop', route: 'workshop' },
    { label: 'Black-Market', route: 'black-market' },
    { label: 'Stash', route: 'stash' },
];
</script>

<template>
    <q-drawer
        :model-value="modelValue"
        @update:model-value="(val) => emit('update:modelValue', val)"
        side="right"
        overlay
        behavior="mobile"
        persistent
        :width="300"
        class="bg-dark text-white">
        <div class="column full-height no-wrap bg-dark">
            <div class="flex justify-end q-pa-md">
                <q-btn
                    class="icon-close"
                    icon="close"
                    flat
                    dense
                    color="primary"
                    @click="emit('update:modelValue', false)" />
            </div>
            <q-scroll-area class="col">
                <q-list class="q-px-md q-py-lg">
                    <template v-for="(menuItem, index) in menuList" :key="index">
                        <RouterLink
                            :to="{ name: menuItem.route }"
                            class="nav-link"
                            @click="emit('update:modelValue', false)">
                            <q-item clickable v-ripple class="q-py-md">
                                <q-item-section class="text-uppercase font-secondary">
                                    {{ menuItem.label }}
                                </q-item-section>
                            </q-item>
                        </RouterLink>
                    </template>
                </q-list>
            </q-scroll-area>
        </div>
    </q-drawer>
</template>

<style lang="scss" scoped>
.nav-link {
    display: block;
    color: inherit;
    text-decoration: none;
}

.icon-close {
    border-radius: 0.3125rem;
}

:deep(.q-drawer) {
    position: fixed !important;
    height: 100vh !important;
    background-color: #0f1620 !important;
}

.font-secondary {
    font-family: inherit;
    letter-spacing: 0.1em;
}

:deep(.q-item) {
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;

    &:hover {
        background: rgb(255 255 255 / 5%);
    }
}
</style>
