<script setup lang="ts">
import { usePaginatedInventoryGoods } from 'src/composables/usePaginatedInventoryGoods';
import { useTopUpPayment } from 'src/composables/useTopUpPayment';
import ItemBalance from 'src/components/items/ItemBalance.vue';
import { useTopUpState } from 'src/composables/useTopUpState';
import { useStoreInventory } from 'stores/inventory.store';
import type { PaymentType } from 'stores/balance.store';
import { useStoreBalance } from 'stores/balance.store';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import type { QForm } from 'quasar';

const topUpForm = ref<QForm | null>(null);
const { currentPage, loadPaginatedInventoryGoods } = usePaginatedInventoryGoods();
const storeInventory = useStoreInventory();
const storeBalance = useStoreBalance();
const route = useRoute();
const router = useRouter();
const isOpen = ref(false);
const {
    paymentTypes,
    paymentType,
    topUpAmount,
    minAmounts,
    resetAmount,
    increment,
    decrement,
    calculatedAmount,
} = useTopUpState();
const { pending, handlePayment } = useTopUpPayment(paymentType, topUpAmount, minAmounts);

const preventIncorrectChars = (e: KeyboardEvent) => {
    if (!/[\d.]/.test(e.key)) e.preventDefault();
};

const handlePaste = (e: ClipboardEvent) => {
    const pastedVal = e.clipboardData?.getData('text');

    if (pastedVal && !/^\d+$/.test(pastedVal)) e.preventDefault();
};

onMounted(() => {
    void (async () => {
        const query = route.query;

        if (query.session_id && query.status === 'success') {
            const amount = Number(query.amount);
            const pType = query.paymentType as PaymentType;

            if (!isNaN(amount) && pType) {
                await storeBalance.topUpBalance(
                    query.session_id as string,
                    'success',
                    amount,
                    pType,
                );
                await router.replace({ query: {} });
            }
        }
    })();
});

watch(
    () => storeBalance.balance,
    () => {
        void storeBalance.displayBalance();
    },
    { immediate: true },
);

const onSubmit = async () => {
    if (topUpForm.value) {
        await handlePayment(topUpForm.value);
    }
};

const handleNextPage = async () => {
    if (currentPage.value < storeInventory.totalInventoryPages) {
        currentPage.value++;
        await loadPaginatedInventoryGoods();
    }
};

const handlePrevPage = async () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        await loadPaginatedInventoryGoods();
    }
};
</script>

<template>
    <div class="footer q-mt-sm">
        <Teleport to="body">
            <q-dialog
                v-model="isOpen"
                backdrop-filter="blur(1rem) brightness(30%)"
                transition-show="scale"
                transition-hide="scale">
                <div class="modal-card">
                    <div class="header-section text-center">
                        <q-icon
                            name="monetization_on"
                            color="secondary"
                            size="2.625rem"
                            class="q-mb-xs" />
                        <h2
                            class="text-h5 text-secondary text-weight-bolder uppercase letter-spacing-2 q-ma-none">
                            Vault Top-Up
                        </h2>
                        <p class="text-caption text-grey-6 q-mt-xs">Increase your gold reserves</p>
                    </div>
                    <q-form
                        ref="topUpForm"
                        @submit.prevent="
                            () => {
                                void onSubmit();
                            }
                        ">
                        <div class="select-box q-mt-lg">
                            <q-select
                                v-model="paymentType"
                                :options="paymentTypes"
                                filled
                                dense
                                dark
                                color="secondary"
                                label="Payment Method"
                                label-color="primary"
                                class="custom-select"
                                :rules="[
                                    (val: { value: string } | null) => !!val?.value || 'Required',
                                ]"
                                @update:model-value="resetAmount" />
                        </div>
                        <div class="amount-control-wrapper column items-center q-mt-sm">
                            <div class="text-caption text-grey-5 uppercase letter-spacing-1">
                                Cost:
                                <span class="text-secondary text-weight-bolder">
                                    ${{ calculatedAmount }}
                                </span>
                            </div>
                            <div class="amount-stepper flex items-center no-wrap q-mt-md">
                                <q-btn
                                    :disable="
                                        !paymentType?.value ||
                                        topUpAmount <=
                                            (paymentType
                                                ? (minAmounts[paymentType.value as string] ?? 0)
                                                : 0)
                                    "
                                    icon="remove"
                                    color="primary"
                                    flat
                                    round
                                    dense
                                    size="sm"
                                    @click="decrement" />
                                <q-input
                                    v-model.number="topUpAmount"
                                    type="number"
                                    input-class="text-primary text-h4 text-center text-weight-bolder"
                                    style="width: 5.625rem"
                                    dense
                                    dark
                                    borderless
                                    @keypress="preventIncorrectChars"
                                    @paste="handlePaste" />
                                <q-btn
                                    icon="add"
                                    color="primary"
                                    flat
                                    round
                                    dense
                                    size="sm"
                                    @click="increment" />
                            </div>
                        </div>
                        <div class="actions-stack q-mt-xl">
                            <q-btn
                                type="submit"
                                :loading="pending"
                                label="PROCEED TO PAYMENT"
                                color="secondary"
                                text-color="dark"
                                unelevated
                                class="full-width confirm-btn">
                                <template #loading>
                                    <q-spinner-hourglass size="1.25rem" />
                                </template>
                            </q-btn>
                            <q-btn
                                v-close-popup
                                label="Cancel"
                                flat
                                color="grey-7"
                                class="full-width q-mt-sm cancel-btn" />
                        </div>
                    </q-form>
                </div>
            </q-dialog>
        </Teleport>
        <div class="inner-grid">
            <div class="side-box"></div>
            <div class="pagination-box">
                <div class="custom-pagination flex items-center no-wrap">
                    <q-btn
                        icon="chevron_left"
                        flat
                        round
                        dense
                        color="primary"
                        class="nav-btn"
                        :disable="currentPage <= 1"
                        @click="
                            () => {
                                void handlePrevPage();
                            }
                        " />
                    <div class="page-info text-primary text-weight-bolder uppercase">
                        {{ currentPage }} / {{ storeInventory.totalInventoryPages }}
                    </div>
                    <q-btn
                        icon="chevron_right"
                        flat
                        round
                        dense
                        color="primary"
                        class="nav-btn"
                        :disable="currentPage >= storeInventory.totalInventoryPages"
                        @click="
                            () => {
                                void handleNextPage();
                            }
                        " />
                </div>
            </div>
            <div class="side-box justify-end">
                <div class="balance-panel">
                    <div
                        class="balance-wrapper"
                        style="display: flex; justify-content: flex-end; min-width: 8.75rem">
                        <div
                            v-if="storeBalance.pending && !storeBalance.balance.gold"
                            class="row q-gutter-x-md no-wrap items-center">
                            <q-skeleton type="text" width="2.1875rem" dark />
                            <q-skeleton type="text" width="2.1875rem" dark />
                            <q-skeleton type="text" width="2.1875rem" dark />
                        </div>
                        <ItemBalance v-else />
                    </div>
                    <div class="separator-v"></div>
                    <q-btn
                        class="btn-add"
                        icon="add"
                        flat
                        dense
                        color="primary"
                        size="sm"
                        @click="isOpen = true" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.modal-card {
    max-width: 26rem;
    width: 100%;
    box-shadow: 0 1.875rem 3.75rem rgb(0 0 0 / 70%);
    background:
        radial-gradient(circle at top left, rgb(255 255 255 / 3%) 0%, transparent 40%),
        linear-gradient(180deg, #161616 0%, #0d0d0d 100%);
    border: 0.0625rem solid rgb(255 255 255 / 10%);
    border-radius: 1rem;
    padding: 2rem;
}

.amount-stepper {
    box-shadow: inset 0 0.125rem 0.5rem rgb(0 0 0 / 50%);
    background: rgb(0 0 0 / 30%);
    padding: 0.125rem 0.75rem;
    border-radius: 0.5rem;
    border: 0.0625rem solid rgb(255 255 255 / 5%);
}

.confirm-btn {
    height: 3.25rem;
    font-size: 0.95rem;
    font-weight: 900;
    letter-spacing: 0.09375rem;
    box-shadow: 0 0.25rem 0.9375rem rgb(0 0 0 / 30%);
    border-radius: 0.375rem;
}

.cancel-btn {
    font-weight: 700;
    border-radius: 0.375rem;
    text-transform: none;
    margin-top: 0.5rem;
}

.footer {
    width: 100%;
    padding-top: 1rem;
    border-top: 0.0625rem solid rgb(255 255 255 / 8%);
}

.inner-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    width: 100%;
}

.side-box {
    display: flex;
    align-items: center;
    min-width: 7.5rem;
}

.pagination-box {
    display: flex;
    justify-content: center;
}

.custom-pagination {
    gap: 0.5rem;
    background: rgb(0 0 0 / 20%);
    padding: 0.125rem 0.5rem;
    border-radius: 1.875rem;
    border: 0.0625rem solid rgb(255 255 255 / 5%);
}

.page-info {
    min-width: 3.5rem;
    font-size: 0.8rem;
    letter-spacing: 0.0625rem;
    text-align: center;
}

.nav-btn {
    transition: transform 0.2s ease;

    &:active {
        transform: scale(0.9);
    }
}

.balance-panel {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    box-shadow: inset 0 0.125rem 0.25rem rgb(0 0 0 / 30%);
    background: rgb(0 0 0 / 40%);
    padding: 0.125rem 0.75rem;
    border: 0.0625rem solid rgb(255 255 255 / 12%);
    border-radius: 0.5rem;
}

.balance-wrapper :deep(.balance-row) {
    gap: 1rem;
}

.separator-v {
    width: 0.0625rem;
    height: 1rem;
    background: rgb(255 255 255 / 15%);
    margin: 0 0.375rem;
}

.btn-add {
    font-size: 0.75rem;
}

.letter-spacing-1 {
    letter-spacing: 0.0625rem;
}

.letter-spacing-2 {
    letter-spacing: 0.125rem;
}

:deep(.q-field--filled .q-field__control) {
    background: rgb(0 0 0 / 30%);
    border-radius: 0.5rem;

    &::before {
        border-bottom: none;
    }
}

@media (width <= 37.5rem) {
    .modal-card {
        padding: 1.5rem;
    }

    .inner-grid {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .side-box {
        justify-content: center;
        order: 1;
    }

    .pagination-box {
        order: 2;
    }
}
</style>
