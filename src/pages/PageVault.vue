<script setup lang="ts">
import VaultContent from 'src/components/vault/VaultContent.vue';
import VaultFooter from 'src/components/vault/VaultFooter.vue';
import VaultHeader from 'src/components/vault/VaultHeader.vue';
</script>

<template>
    <q-page class="flex justify-center vault-page">
        <section id="vault">
            <h1 class="sr-only">Vault</h1>
            <div class="inventory">
                <div class="inner">
                    <VaultHeader />
                    <VaultContent />
                    <VaultFooter />
                </div>
            </div>
        </section>
    </q-page>
</template>

<style lang="scss" scoped>
.vault-page {
    padding-top: 3.2rem;
    padding-bottom: 1rem;
    min-height: auto;
}

#vault {
    width: fit-content;
}

.inventory {
    position: relative;
    box-shadow: 0 0.625rem 1.875rem rgb(0 0 0 / 90%);
    background: #141414;
    border: 0.0625rem solid rgb(255 255 255 / 10%);
    border-radius: 0.375rem;
    padding: 1rem;
}

.inner {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}
</style>
