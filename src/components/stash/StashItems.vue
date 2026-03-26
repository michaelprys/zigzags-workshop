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
                            <q-img class="img shadow-24" :src="good.image_url ?? ''" ratio="1" />
                            <div class="inner q-ml-lg">
                                <div class="info column justify-center">
                                    <span class="text-h6 text-primary q-mb-xs text-weight-bold">
                                        {{ good.name }}
                                    </span>
                                    <span
                                        class="text-caption text-grey-6 uppercase letter-spacing-1">
                                        {{ good.category }}
                                    </span>
                                    <div class="q-mt-md">
                                        <span class="text-secondary text-weight-bolder text-h6">
                                            {{ good.price }}
                                        </span>
                                        <span class="text-grey-7 q-ml-sm text-caption uppercase">
                                            Gold / unit
                                        </span>
                                    </div>
                                </div>
                                <div class="actions">
                                    <q-btn
                                        flat
                                        color="grey-8"
                                        size="sm"
                                        round
                                        icon="close"
                                        class="hover-red"
                                        @click="removeFromStash(goodIdx)" />
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
                                        <span class="q-mx-md text-weight-bold text-h6 value-text">
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
    border-radius: 0.75rem;
    overflow: hidden;
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
    display: flex;
    padding: 1.25rem 1.75rem;
    border-bottom: 0.0625rem solid rgb(255 255 255 / 5%);
    transition: background 0.3s ease;
}

.card:hover {
    background: rgb(255 255 255 / 1.5%);
}

.card:last-child {
    border-bottom: none;
}

.img {
    width: 7.5rem;
    height: 7.5rem;
    border-radius: 0.375rem;
    border: 0.0625rem solid rgb(255 255 255 / 10%);
    background: #000;
}

.inner {
    display: flex;
    justify-content: space-between;
    flex: 1;
}

.panel-price {
    position: sticky;
    width: 25rem;
    border: 0.0625rem solid rgba($secondary, 0.2);
    top: 2rem;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price-row .label {
    font-size: 0.8rem;
    letter-spacing: 0.0625rem;
    color: #888;
    text-transform: uppercase;
}

.price-row .value {
    font-size: 1.1rem;
    color: #eee;
}

.price-glow {
    text-shadow: 0 0 0.9375rem rgba($secondary, 0.3);
}

.actions {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
}

.quantity-control {
    box-shadow: inset 0 0.125rem 0.25rem rgb(0 0 0 / 50%);
    background: rgb(0 0 0 / 40%);
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    border: 0.0625rem solid rgb(255 255 255 / 6%);
}

.value-text {
    color: $primary;
}

.separator-custom {
    height: 0.0625rem;
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 10%), transparent);
}

.trade-btn {
    height: 3.625rem;
    font-weight: 900;
    border-radius: 0.375rem;
    letter-spacing: 0.125rem;
    box-shadow: 0 0.25rem 0.9375rem rgb(0 0 0 / 30%);
}

.hover-red:hover {
    color: $negative !important;
}

.letter-spacing-1 {
    letter-spacing: 0.0625rem;
}

.letter-spacing-2 {
    letter-spacing: 0.125rem;
}

.letter-spacing-3 {
    letter-spacing: 0.1875rem;
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
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .inner {
        flex-direction: column;
        padding: 1.5rem 0 0;
        margin-left: 0;
    }

    .actions {
        align-items: center;
        gap: 1.5rem;
    }
}
</style>
