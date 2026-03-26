<script setup lang="ts">
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreBalance } from 'stores/balance.store';
import { delayUtils } from 'src/utils/delay.utils';
import { useStoreGoods } from 'stores/goods.store';
import { useStoreAuth } from 'stores/auth.store';
import supabase from 'src/api/supabase.api';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const storeAuth = useStoreAuth();
const storeBalance = useStoreBalance();
const storeGoods = useStoreGoods();
const storeInventory = useStoreInventory();
const router = useRouter();
const dialog = ref(false);
const pending = ref(false);
const handleTrade = async () => {
    pending.value = true;
    try {
        const success = await storeGoods.purchaseInvitation();

        if (success) {
            await delayUtils(1000);
            await storeInventory.checkInvitation();
            dialog.value = false;
        }
    } catch (err) {
        console.error(err);
    } finally {
        pending.value = false;
    }
};

watch(
    () => storeInventory.invitation,
    async (newVal) => {
        if (newVal) {
            await delayUtils(1500);
            await router.push({ name: 'black-market' });
        }
    },
    { immediate: true },
);
onMounted(async () => {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
        await Promise.all([storeBalance.displayBalance(), storeInventory.checkInvitation()]);
    }
});
</script>

<template>
    <q-page class="flex flex-center">
        <Teleport to="body">
            <q-dialog
                v-model="dialog"
                backdrop-filter="blur(1rem) brightness(30%)"
                transition-show="scale"
                transition-hide="scale">
                <div class="modal-card">
                    <div class="row items-center justify-between q-mb-xl">
                        <div class="column">
                            <span
                                class="text-h5 text-secondary text-weight-bolder uppercase letter-spacing-1">
                                Complete Trade
                            </span>
                            <span class="text-caption text-grey-6">Authorization for access</span>
                        </div>
                        <div class="balance-container">
                            <span class="text-weight-bold q-mr-sm text-white">
                                {{ storeBalance.balance['gold'] }}
                            </span>
                            <q-img
                                src="~assets/images/vault/gold.avif"
                                width="1.125rem"
                                height="1.125rem" />
                        </div>
                    </div>
                    <div class="column">
                        <div class="payment-info q-pa-lg q-mb-xl">
                            <div class="row justify-between items-center">
                                <span
                                    class="text-grey-5 uppercase text-caption text-weight-bold letter-spacing-1">
                                    Invitation Fee
                                </span>
                                <span class="text-h5 text-secondary text-weight-bolder">
                                    20,000
                                    <small class="text-weight-light">G</small>
                                </span>
                            </div>
                        </div>
                        <div class="row q-gutter-x-md no-wrap items-center">
                            <q-btn
                                v-close-popup
                                label="Decline"
                                flat
                                color="grey-7"
                                class="action-btn flex-grow cancel-btn" />
                            <q-btn
                                :loading="pending"
                                label="CONFIRM PURCHASE"
                                color="secondary"
                                text-color="dark"
                                unelevated
                                class="action-btn trade-btn flex-grow"
                                @click="handleTrade">
                                <template #loading>
                                    <q-spinner-hourglass />
                                </template>
                            </q-btn>
                        </div>
                    </div>
                </div>
            </q-dialog>
        </Teleport>
        <section id="black-market-access" class="q-px-md">
            <div class="access-card overflow-hidden">
                <q-img
                    class="access-img"
                    src="~assets/images/black-market-access/black-market-access.avif"
                    height="20rem">
                    <div class="img-overlay absolute-full"></div>
                </q-img>
                <div class="content-section q-pa-xl column flex-center text-center">
                    <template v-if="!storeInventory.invitation && !storeAuth.session">
                        <h2
                            class="text-h4 text-negative text-weight-bolder uppercase letter-spacing-2">
                            Invitation Required
                        </h2>
                        <p class="text-subtitle1 text-grey-5 q-mt-md">
                            Access your vault to verify your standing with the syndicate.
                        </p>
                        <q-btn
                            class="main-action-btn q-mt-lg"
                            color="secondary"
                            text-color="dark"
                            unelevated
                            label="Go to Vault"
                            :to="{ name: 'vault' }" />
                    </template>
                    <template v-if="!storeInventory.invitation && storeAuth.session">
                        <h2
                            class="text-h4 text-secondary text-weight-bolder uppercase letter-spacing-2">
                            Black Market Entry
                        </h2>
                        <p class="text-subtitle1 text-grey-5 q-mt-md">
                            Pay the entry fee to unlock restricted treasures.
                        </p>
                        <q-btn
                            class="main-action-btn q-mt-lg"
                            color="secondary"
                            text-color="dark"
                            unelevated
                            label="Buy Invitation (20k Gold)"
                            @click="dialog = true" />
                    </template>
                    <template v-if="storeInventory.invitation">
                        <h2
                            class="text-h4 text-primary text-weight-bolder uppercase letter-spacing-2">
                            Greetings, Associate
                        </h2>
                        <p class="text-subtitle1 text-grey-5 q-mt-md">
                            Tread carefully. Not everything here is what it seems.
                        </p>
                        <div
                            class="flex flex-center q-mt-lg text-positive text-weight-bold uppercase letter-spacing-1">
                            <q-spinner-hourglass class="q-mr-sm" size="1.5rem" />
                            Establishing Connection...
                        </div>
                    </template>
                </div>
            </div>
        </section>
    </q-page>
</template>

<style lang="scss" scoped>
#black-market-access {
    max-width: 46rem;
    width: 100%;
    padding-block: 5rem;
}

.access-card {
    box-shadow: 0 1.875rem 3.75rem rgb(0 0 0 / 60%);
    background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
    border-radius: 1.25rem;
    border: 0.0625rem solid rgb(255 255 255 / 8%);
}

.access-img {
    filter: sepia(0.2) brightness(0.7);
    border-bottom: 0.0625rem solid rgb(255 255 255 / 5%);
}

.img-overlay {
    background: linear-gradient(to bottom, transparent 60%, #1a1a1a 100%);
}

.main-action-btn {
    height: 3.375rem;
    padding-inline: 3rem;
    font-weight: 900;
    border-radius: 0.5rem;
    letter-spacing: 0.09375rem;
    box-shadow: 0 0.625rem 1.25rem rgb(0 0 0 / 30%);
}

.modal-card {
    max-width: 32rem;
    width: 100%;
    box-shadow: 0 2.5rem 5rem rgb(0 0 0 / 80%);
    background:
        radial-gradient(circle at top left, rgb(255 255 255 / 3%) 0%, transparent 40%),
        linear-gradient(180deg, #161616 0%, #0d0d0d 100%);
    border: 0.0625rem solid rgb(255 255 255 / 10%);
    border-radius: 1rem;
    padding: 3.5rem 3rem;
}

.balance-container {
    display: flex;
    align-items: center;
    box-shadow: inset 0 0.125rem 0.625rem rgb(0 0 0 / 50%);
    background: rgb(0 0 0 / 40%);
    padding: 0.5rem 1rem;
    border-radius: 1.875rem;
    border: 0.0625rem solid rgb(255 255 255 / 8%);
}

.payment-info {
    box-shadow: inset 0 0.125rem 0.9375rem rgb(0 0 0 / 30%);
    background: rgb(0 0 0 / 20%);
    border-radius: 0.75rem;
    border: 0.0625rem solid rgb(255 255 255 / 5%);
}

.action-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 3.375rem;
    font-weight: 900;
    border-radius: 0.5rem;
}

.trade-btn {
    flex: 2;
    letter-spacing: 0.0625rem;
    box-shadow: 0 0.25rem 0.9375rem rgb(0 0 0 / 30%);
}

.cancel-btn {
    flex: 1;
    font-weight: 700;
}

.letter-spacing-1 {
    letter-spacing: 0.0625rem;
}

.letter-spacing-2 {
    letter-spacing: 0.125rem;
}

@media (width <= 37.5rem) {
    .content-section {
        padding: 2.5rem 1.5rem;
    }

    .main-action-btn {
        width: 100%;
        padding-inline: 1rem;
    }

    .modal-card {
        padding: 2rem 1.5rem;
    }

    .row.no-wrap {
        flex-direction: column-reverse;
        gap: 1rem;
    }

    .action-btn {
        width: 100%;
    }
}
</style>
