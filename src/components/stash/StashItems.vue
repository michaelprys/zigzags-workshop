<script setup lang="ts">
import { useManageStash } from 'src/composables/useManageStash';
import { onMounted, reactive, ref, watch } from 'vue';
import { useStoreGoods } from 'stores/goods.store';
import { useStoreAuth } from 'stores/auth.store';
import gsap from 'gsap';

const { basePrice, goblinTax, removeFromStash, increaseGoodQuantity, decreaseGoodQuantity } =
    useManageStash();
const storeAuth = useStoreAuth();
const storeGoods = useStoreGoods();
const vaultAccessed = ref(false);

const emit = defineEmits<{
    (e: 'openDialog'): void;
}>();

onMounted(async () => {
    if (!storeAuth.session) {
        await storeAuth.checkSession();
    }
    vaultAccessed.value = !!storeAuth.session;
});

const tweened = reactive({
    tweenedBasePrice: basePrice.value,
    tweenedGoblinTax: goblinTax.value,
    tweenedFinalPrice: basePrice.value + goblinTax.value,
});

watch([basePrice, goblinTax], ([newBasePrice, newGoblinTax]) => {
    gsap.to(tweened, {
        duration: 0.5,
        tweenedBasePrice: newBasePrice,
        tweenedGoblinTax: newGoblinTax,
        tweenedFinalPrice: newBasePrice + newGoblinTax,
    });
});
</script>

<template>
    <section id="stash" class="column flex-center relative-position">
        <div class="q-pa-md container-limited">
            <h1
                class="title text-center text-h3 q-mb-xl text-weight-bolder text-uppercase letter-spacing-3">
                Your Stash
            </h1>
            <div class="wrapper">
                <div class="panel main-panel">
                    <ul class="stash-list">
                        <li
                            v-for="(good, goodIdx) in storeGoods.stashGoods"
                            :key="good.id"
                            class="card">
                            <div class="card-header-mobile">
                                <div class="column">
                                    <h3
                                        class="text-h6 text-primary text-weight-bolder q-ma-none line-height-1">
                                        {{ good.name }}
                                    </h3>
                                    <span
                                        class="text-caption text-grey-7 uppercase letter-spacing-1">
                                        {{ good.category }}
                                    </span>
                                </div>
                                <q-btn
                                    flat
                                    round
                                    dense
                                    color="grey-8"
                                    icon="close"
                                    size="sm"
                                    class="remove-btn-dynamic"
                                    @click="removeFromStash(goodIdx)" />
                            </div>

                            <div class="card-inner">
                                <div class="image-box">
                                    <q-img
                                        class="img shadow-24"
                                        :src="good.image_url ?? ''"
                                        ratio="1">
                                        <template #loading>
                                            <div
                                                class="absolute-full flex flex-center custom-loader">
                                                <q-spinner-dots color="secondary" size="1.5rem" />
                                            </div>
                                        </template>
                                    </q-img>
                                </div>

                                <div class="content-box">
                                    <div class="top-info desktop-only">
                                        <h3
                                            class="text-h6 text-primary text-weight-bolder q-ma-none line-height-1">
                                            {{ good.name }}
                                        </h3>
                                        <span
                                            class="text-caption text-grey-7 uppercase letter-spacing-1">
                                            {{ good.category }}
                                        </span>
                                    </div>

                                    <div class="bottom-actions">
                                        <div class="price-display">
                                            <span class="text-secondary text-weight-bolder text-h5">
                                                {{ good.price }}
                                            </span>
                                            <span
                                                class="text-grey-8 q-ml-xs text-caption uppercase">
                                                Gold
                                            </span>
                                        </div>

                                        <div class="quantity-control flex items-center no-wrap">
                                            <q-btn
                                                dense
                                                icon="remove"
                                                flat
                                                round
                                                color="secondary"
                                                size="sm"
                                                :disable="(good.quantity ?? 0) <= 1"
                                                @click="decreaseGoodQuantity(good)" />
                                            <span
                                                class="q-mx-sm text-weight-bold text-h6 value-text">
                                                {{ good.quantity }}
                                            </span>
                                            <q-btn
                                                dense
                                                icon="add"
                                                flat
                                                round
                                                color="secondary"
                                                size="sm"
                                                :disable="(good.quantity ?? 0) >= 5"
                                                @click="increaseGoodQuantity(good)" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <q-btn
                                flat
                                round
                                dense
                                color="grey-8"
                                icon="close"
                                size="sm"
                                class="remove-btn-dynamic desktop-only"
                                @click="removeFromStash(goodIdx)" />
                        </li>
                    </ul>
                </div>

                <div class="column panel panel-price">
                    <div class="panel-price-inner q-pa-xl">
                        <div class="price-row">
                            <span class="label">Subtotal</span>
                            <span class="value">{{ tweened.tweenedBasePrice.toFixed(0) }} G</span>
                        </div>
                        <div class="price-row q-mt-md">
                            <span class="label">Goblin Tax</span>
                            <span class="value text-orange-9 text-weight-bolder">
                                +{{ tweened.tweenedGoblinTax.toFixed(0) }} G
                            </span>
                        </div>
                        <div class="q-my-xl separator-custom"></div>
                        <div class="price-row total">
                            <span
                                class="text-secondary uppercase text-weight-bolder letter-spacing-1">
                                Total
                            </span>
                            <span class="text-h4 text-secondary text-weight-bolder price-glow">
                                {{ tweened.tweenedFinalPrice.toFixed(0) }} G
                            </span>
                        </div>
                        <q-btn
                            class="full-width q-mt-xl trade-btn"
                            :color="vaultAccessed ? 'secondary' : 'grey-10'"
                            :text-color="vaultAccessed ? 'dark' : 'grey-7'"
                            unelevated
                            size="lg"
                            :disable="!vaultAccessed"
                            :label="vaultAccessed ? 'BEGIN TRADE' : 'VAULT LOCKED'"
                            @click="emit('openDialog')" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
#stash {
    padding-bottom: 12rem;
    padding-top: 4rem;
}

.container-limited {
    max-width: 72.5rem;
    width: 100%;
}

.wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 2rem;
}

.panel {
    box-shadow:
        inset 0 0 1.25rem rgb(0 0 0 / 50%),
        0 1.25rem 3.125rem rgb(0 0 0 / 70%);
    background:
        radial-gradient(circle at top left, rgb(255 255 255 / 3%) 0%, transparent 40%),
        linear-gradient(180deg, #161616 0%, #0d0d0d 100%);
    border: 0.0625rem solid rgb(255 255 255 / 8%);
    border-radius: 1rem;
}

.main-panel {
    flex: 1;
}

.stash-list {
    padding: 0;
    margin: 0;
    list-style: none;
}

.card {
    position: relative;
    padding: 2rem;
    border-bottom: 0.0625rem solid rgb(255 255 255 / 5%);
    transition: background 0.3s ease;

    &:hover {
        background: rgb(255 255 255 / 2%);
    }
}

.card-header-mobile {
    display: none;
}

.card-inner {
    display: flex;
    gap: 2rem;
}

.img {
    width: 9rem;
    height: 9rem;
    border-radius: 0.75rem;
    border: 0.0625rem solid rgb(255 255 255 / 12%);
    background-color: transparent !important;
}

:deep(.q-img__loading),
:deep(.q-img__container) {
    background-color: transparent !important;
}

.custom-loader {
    background: rgb(255 255 255 / 3%);
}

.content-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
}

.remove-btn-dynamic {
    position: absolute;
    z-index: 10;
    min-width: 1.75rem;
    min-height: 1.75rem;
    width: 1.75rem;
    height: 1.75rem;
    background: rgb(0 0 0 / 30%);
    pointer-events: auto;
    top: 1rem;
    right: 1rem;
    border-radius: 50%;

    &:hover {
        background: rgba($negative, 0.2) !important;
        color: $negative !important;
    }

    :deep(.q-focus-helper) {
        display: none !important;
    }
}

.bottom-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.quantity-control {
    box-shadow: inset 0 0.125rem 0.25rem rgb(0 0 0 / 50%);
    background: rgb(0 0 0 / 40%);
    padding: 0.25rem 0.5rem;
    border-radius: 0.625rem;
    border: 0.0625rem solid rgb(255 255 255 / 6%);
}

.value-text {
    min-width: 1.75rem;
    color: $primary;
    text-align: center;
}

.panel-price {
    position: sticky;
    width: 26rem;
    border: 0.0625rem solid rgba($secondary, 0.2);
    top: 2rem;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .label {
        font-size: 0.85rem;
        color: #777;
        text-transform: uppercase;
    }

    .value {
        font-size: 1.25rem;
        font-weight: 600;
        color: #fff;
    }
}

.price-glow {
    text-shadow: 0 0 1rem rgba($secondary, 0.4);
}

.trade-btn {
    height: 4rem;
    font-size: 1.1rem;
    font-weight: 900;
    border-radius: 0.5rem;
}

@media (width <= 64rem) {
    .wrapper {
        flex-direction: column;
        align-items: center;
    }

    .panel {
        width: 100%;
    }

    .panel-price {
        position: static;
    }
}

@media (width <= 37.5rem) {
    .card {
        padding: 1.5rem;
    }

    .card-header-mobile {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        margin-bottom: 1.25rem;
    }

    .remove-btn-dynamic {
        position: relative;
        top: 0;
        right: 0;
        background: rgb(255 255 255 / 5%);
        flex-shrink: 0;
    }

    .desktop-only {
        display: none !important;
    }

    .card-inner {
        flex-direction: column;
        gap: 1rem;
    }

    .img {
        width: 100%;
        height: 14rem;
    }

    .bottom-actions {
        padding-top: 1rem;
        border-top: 1px solid rgb(255 255 255 / 5%);
    }
}
</style>
