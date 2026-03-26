<script setup lang="ts">
import { useStoreBalance } from 'stores/balance.store';
import { onMounted, computed } from 'vue';

const storeBalance = useStoreBalance();

const isLoading = computed(() => {
    return (
        storeBalance.balance.gold === null ||
        storeBalance.balance.emberheart_rubies === null ||
        storeBalance.balance.gamblers_lootbox === null
    );
});

onMounted(async () => {
    await storeBalance.displayBalance();
});
</script>

<template>
    <div class="balance-container">
        <Transition name="fade" mode="out-in">
            <div v-if="isLoading" key="loading" class="balance-row">
                <div v-for="i in 3" :key="i" class="balance-item">
                    <q-skeleton type="text" width="1.8rem" dark />
                    <q-skeleton type="circle" size="1.25rem" dark />
                </div>
            </div>

            <div v-else key="ready" class="balance-row">
                <slot />
                <div class="balance-item">
                    <span>{{ storeBalance.balance.gold }}</span>
                    <img src="~assets/images/vault/gold.avif" class="balance-icon icon-gold" />
                    <q-tooltip class="bg-primary text-negative">Gold</q-tooltip>
                </div>

                <div class="balance-item">
                    <span>{{ storeBalance.balance.emberheart_rubies }}</span>
                    <img
                        src="~assets/images/vault/emberheart-rubies.avif"
                        class="balance-icon icon-ruby" />
                    <q-tooltip class="bg-primary text-negative">Emberheart rubies</q-tooltip>
                </div>

                <div class="balance-item">
                    <span>{{ storeBalance.balance.gamblers_lootbox }}</span>
                    <img
                        src="~assets/images/vault/gamblers-lootbox.avif"
                        class="balance-icon icon-box" />
                    <q-tooltip class="bg-primary text-negative">Gambler's lootbox</q-tooltip>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style lang="scss" scoped>
.balance-container {
    display: flex;
    align-items: center;
    min-height: 1.75rem;
}

.balance-row {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    user-select: none;
}

.balance-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: $primary;
    font-weight: 600;
    color: #fff;

    span {
        font-size: 0.9rem;
        letter-spacing: 0.02rem;
    }
}

.balance-icon {
    display: block;
    filter: drop-shadow(0 2px 4px rgb(0 0 0 / 50%));
    object-fit: contain;

    &.icon-gold {
        width: 1.125rem;
        height: 1.125rem;
    }

    &.icon-ruby {
        width: 1.5rem;
        height: 1.5rem;
    }

    &.icon-box {
        width: 1.375rem;
        height: 1.375rem;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
