<script setup lang="ts">
import { useManageStash } from 'src/composables/useManageStash';
import ItemBalance from 'src/components/items/ItemBalance.vue';
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreBalance } from 'stores/balance.store';
import { computed, reactive, ref } from 'vue';
import { delay } from 'src/utils/delay.utils';
import { useRouter } from 'vue-router';
import type { QForm } from 'quasar';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const myForm = ref<QForm | null>(null);
const pending = ref(false);
const router = useRouter();
const storeInventory = useStoreInventory();
const storeBalance = useStoreBalance();

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const { finalPrice } = useManageStash();
const emberheartRubies = computed(() => Math.floor(finalPrice.value * 0.01));
const gamblersLootbox = computed(() => Math.ceil(finalPrice.value * 0.001));

type PaymentKey = 'gold' | 'emberheart_rubies' | 'gamblers_lootbox';

const paymentTypes = computed(() => [
    { label: `Gold (${finalPrice.value})`, value: 'gold' },
    { label: `Emberheart Rubies (${emberheartRubies.value})`, value: 'emberheart_rubies' },
    { label: `Gambler's Lootbox (${gamblersLootbox.value})`, value: 'gamblers_lootbox' },
]);

const paymentType = ref<PaymentKey | null>(null);

const paymentData = reactive<Record<PaymentKey, number>>({
    gold: finalPrice.value,
    emberheart_rubies: emberheartRubies.value,
    gamblers_lootbox: gamblersLootbox.value,
});

const validateFunds = (type: PaymentKey | null) => {
    if (!type) return true;
    const amount = paymentData[type];
    const balance = storeBalance.balance[type] ?? 0;
    if (amount > balance)
        return `Not enough ${type.replace(/_/g, ' ')}. ZigZag don't do credit! Top up in yer Vault.`;

    return true;
};

const isTradeDisabled = computed(() => {
    if (!paymentType.value) return false;

    return validateFunds(paymentType.value) !== true;
});

const tradeCancelled = ref(false);

const trade = async () => {
    const type = paymentType.value;
    if (!type) return;
    const cost = paymentData[type];
    await storeBalance.updateBalance(type, cost);
    await storeInventory.saveGoodsToInventory();
};

const handleTrade = async () => {
    tradeCancelled.value = false;
    pending.value = true;
    if (!myForm.value) return;

    try {
        const isValid = await myForm.value.validate();
        if (!isValid || !paymentType.value) {
            pending.value = false;

            return;
        }

        await delay(2000);

        if (!tradeCancelled.value) {
            await trade();
            sessionStorage.setItem('purchaseCompleted', 'true');
            storeBalance.purchaseStatus = '';

            $q.notify({
                type: 'positive',
                message: "Pleasure doin' business!",
                position: 'bottom-right',
            });

            await router.push({ name: 'purchase-success' });
        }
    } catch (err) {
        console.error(err);
    } finally {
        pending.value = false;
    }
};

const cancelTrade = () => {
    tradeCancelled.value = true;
    pending.value = false;
};
</script>

<template>
    <Teleport to="body">
        <q-dialog
            :model-value="props.modelValue"
            backdrop-filter="blur(0.75rem) brightness(40%)"
            transition-show="scale"
            transition-hide="none"
            persistent
            @hide="tradeCancelled = true"
            @update:model-value="(val) => emit('update:modelValue', val)">
            <div class="modal">
                <div class="title-wrapper flex items-center justify-between no-wrap">
                    <h2
                        class="title text-h5 text-secondary text-weight-bolder uppercase letter-spacing-1">
                        Complete trade
                    </h2>
                    <div class="balance-box q-ml-md">
                        <ItemBalance class="balance no-border-balance" />
                    </div>
                </div>

                <q-form ref="myForm" class="q-gutter-md q-mt-lg" @submit.prevent="handleTrade">
                    <q-select
                        v-model="paymentType"
                        :options="paymentTypes"
                        emit-value
                        map-options
                        filled
                        dark
                        color="secondary"
                        label-color="primary"
                        label="Currency of Choice *"
                        :rules="[(val) => !!val || 'Select currency', (val) => validateFunds(val)]">
                        <template #prepend>
                            <q-icon name="monetization_on" color="secondary" />
                        </template>
                    </q-select>

                    <div class="flex justify-between q-mt-xl no-wrap gap-md">
                        <q-btn
                            type="submit"
                            :loading="pending"
                            :disable="isTradeDisabled"
                            label="CONFIRM TRADE"
                            color="secondary"
                            text-color="dark"
                            unelevated
                            class="trade-btn text-weight-bolder flex-grow">
                            <template #loading>
                                <q-spinner-hourglass class="on-left" />
                                Trading...
                            </template>
                        </q-btn>
                        <q-btn
                            v-close-popup
                            label="Cancel"
                            flat
                            color="grey-7"
                            class="cancel-btn"
                            @click="cancelTrade" />
                    </div>
                </q-form>
            </div>
        </q-dialog>
    </Teleport>
</template>

<style lang="scss" scoped>
.modal {
    max-width: 40.25rem;
    width: 100%;
    background:
        radial-gradient(circle at top left, rgb(255 255 255 / 3%) 0%, transparent 40%),
        linear-gradient(180deg, #161616 0%, #0d0d0d 100%);
    padding: 2rem;
    border: 0.0625rem solid rgb(255 255 255 / 10%);
    border-radius: 1rem;
}

.title-wrapper {
    width: 100%;
}

.balance-box {
    background: rgb(0 0 0 / 20%);
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    flex-shrink: 0;
}

.trade-btn {
    height: 3.5rem;
    border-radius: 0.375rem;
}

.cancel-btn {
    padding-inline: 1.5rem;
    border-radius: 0.375rem;
}

.gap-md {
    gap: 1rem;
}

@media (width <= 37.5rem) {
    .modal {
        padding: 1.5rem;
    }

    .title-wrapper {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
    }

    .balance-box {
        margin-left: 0;
    }

    .title {
        font-size: 1.25rem;
    }
}
</style>
