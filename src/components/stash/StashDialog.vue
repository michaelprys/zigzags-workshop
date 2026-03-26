<script setup lang="ts">
import { useManageStash } from 'src/composables/useManageStash';
import ItemBalance from 'src/components/items/ItemBalance.vue';
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreBalance } from 'stores/balance.store';
import { delayUtils } from 'src/utils/delay.utils';
import { useStoreGoods } from 'stores/goods.store';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { QForm } from 'quasar';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const myForm = ref<QForm | null>(null);
const pending = ref(false);
const router = useRouter();
const storeGoods = useStoreGoods();
const storeInventory = useStoreInventory();
const storeBalance = useStoreBalance();

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const { finalPrice } = useManageStash();
const emberheartRubies = computed(() => Math.floor(finalPrice.value * 0.01));
const gamblersLootbox = computed(() => Math.ceil(finalPrice.value * 0.001));

const paymentTypes = computed(
    () =>
        [
            { label: `Gold (${finalPrice.value})`, value: 'gold' },
            { label: `Emberheart Rubies (${emberheartRubies.value})`, value: 'emberheart_rubies' },
            { label: `Gambler's Lootbox (${gamblersLootbox.value})`, value: 'gamblers_lootbox' },
        ] as const,
);

type PaymentKey = 'gold' | 'emberheart_rubies' | 'gamblers_lootbox';

const paymentType = ref<PaymentKey | null>(null);
const paymentData = reactive<Record<PaymentKey, number>>({
    gold: finalPrice.value,
    emberheart_rubies: emberheartRubies.value,
    gamblers_lootbox: gamblersLootbox.value,
});

const validateFunds = (type: PaymentKey) => {
    const amount = paymentData[type];
    const balance = storeBalance.balance[type] ?? 0;
    if (amount > balance) return `Not enough ${type.replace('_', ' ')}`;

    return true;
};

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

    if (!myForm.value || !paymentType.value) {
        pending.value = false;

        return;
    }

    try {
        const isValid = await myForm.value.validate();
        if (!isValid) {
            pending.value = false;

            return;
        }

        await delayUtils(2000);

        if (!tradeCancelled.value) {
            await trade();
            sessionStorage.setItem('purchaseCompleted', 'true');
            storeGoods.stashGoods = [];
            storeBalance.purchaseStatus = '';
            $q.notify({
                type: 'positive',
                message: "Pleasure doin' business!",
                position: 'bottom-right',
            });
            emit('update:modelValue', false);
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
            transition-hide="scale"
            @hide="tradeCancelled = true"
            @update:model-value="(val) => emit('update:modelValue', val)">
            <div class="modal">
                <div class="title-wrapper flex items-center justify-between q-pb-none">
                    <h2
                        class="title text-h5 text-secondary text-weight-bolder uppercase letter-spacing-1">
                        Complete trade
                    </h2>
                    <div class="balance-box">
                        <ItemBalance class="balance no-border-balance" />
                    </div>
                </div>

                <q-form ref="myForm" class="q-gutter-md q-mt-lg" @submit.prevent="handleTrade">
                    <q-select
                        v-model="paymentType"
                        :options="paymentTypes"
                        filled
                        dark
                        color="secondary"
                        label-color="primary"
                        label="Currency of Choice *"
                        :rules="[
                            (val) => !!val || 'Select currency',
                            (val) => (val ? validateFunds(val) : true),
                        ]">
                        <template #prepend>
                            <q-icon name="monetization_on" color="secondary" />
                        </template>
                    </q-select>

                    <div class="flex justify-between q-mt-xl">
                        <q-btn
                            type="submit"
                            :loading="pending"
                            style="width: 12rem; height: 3.5rem"
                            label="CONFIRM TRADE"
                            color="secondary"
                            text-color="dark"
                            unelevated
                            class="trade-btn text-weight-bolder">
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

.balance-box {
    background: rgb(0 0 0 / 20%);
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
}

.trade-btn {
    border-radius: 0.375rem;
}
</style>
