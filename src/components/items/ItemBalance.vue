<script setup lang="ts">
import { useStoreBalance } from 'stores/balance.store';
import { onMounted } from 'vue';

const storeBalance = useStoreBalance();

onMounted(async () => {
    await storeBalance.displayBalance();
});
</script>

<template>
    <div class="balance-row">
        <slot />
        <div class="balance-item">
            <q-skeleton v-if="storeBalance.balance.gold === null" type="text" width="2.1875rem" dark />
            <span v-else>{{ storeBalance.balance.gold }}</span>
            <q-img src="~assets/images/vault/gold.avif" width="1.125rem" height="1.125rem" />
            <q-tooltip anchor="bottom right" self="center start" class="bg-primary">
                <span class="text-caption text-negative">Gold</span>
            </q-tooltip>
        </div>
        <div class="balance-item">
            <q-skeleton
                v-if="storeBalance.balance.emberheart_rubies === null"
                type="text"
                width="2.1875rem"
                dark />
            <span v-else>{{ storeBalance.balance.emberheart_rubies }}</span>
            <q-img src="~assets/images/vault/emberheart-rubies.avif" width="1.5rem" height="1.5rem" />
            <q-tooltip anchor="bottom right" self="center start" class="bg-primary">
                <span class="text-caption text-negative">Emberheart rubies</span>
            </q-tooltip>
        </div>
        <div class="balance-item">
            <q-skeleton
                v-if="storeBalance.balance.gamblers_lootbox === null"
                type="text"
                width="2.1875rem"
                dark />
            <span v-else>{{ storeBalance.balance.gamblers_lootbox }}</span>
            <q-img src="~assets/images/vault/gamblers-lootbox.avif" width="1.375rem" height="1.375rem" />
            <q-tooltip anchor="bottom right" self="center start" class="bg-primary">
                <span class="text-caption text-negative">Gambler's lootbox</span>
            </q-tooltip>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.balance-row {
    display: flex;
    align-items: center;
    min-height: 1.5rem;
    gap: 1.25rem;
    user-select: none;
}

.balance-item {
    display: flex;
    align-items: center;
    min-width: 2.8125rem;
    gap: 0.5rem;
    font-family: $primary;
    font-weight: 600;
    color: #fff;

    span {
        letter-spacing: 0.03125rem;
    }
}

:deep(.q-img) {
    filter: drop-shadow(0 0.125rem 0.25rem rgb(0 0 0 / 50%));
}
</style>
