<script setup lang="ts">
import { useManageStash } from 'src/composables/useManageStash';
import { useMoveImage } from 'src/composables/useMoveImage';
import { useStoreGoods } from 'stores/goods.store';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';

const router = useRouter();
const storeGoods = useStoreGoods();
const { addToStash } = useManageStash();
const isAuth = storeGoods.selectedGood?.requires_access ?? false;
const imgRef = ref<HTMLImageElement | null>(null);
let moveImage: (e: MouseEvent) => void;
let resetImage: () => void = () => {};

onMounted(() => {
    const { moveImage: move, resetImage: reset } = useMoveImage(imgRef.value);

    moveImage = move;
    resetImage = reset;
});
</script>

<template>
    <q-page>
        <section id="good-details">
            <div class="main-wrapper">
                <div class="bg-frame" :class="isAuth ? 'bg-black-market' : 'bg-workshop'"></div>
                <div class="details-layout">
                    <div class="visual-column">
                        <div class="product-frame shadow-24">
                            <img
                                ref="imgRef"
                                class="product-img"
                                :src="storeGoods.selectedGood?.image_url || ''"
                                @mousemove="moveImage"
                                @mouseleave="resetImage" />
                        </div>
                    </div>
                    <div class="info-column">
                        <div class="content-panel">
                            <div class="row justify-between no-wrap q-mb-md items-start">
                                <div class="column">
                                    <span
                                        class="text-overline text-secondary text-weight-bolder letter-spacing-3">
                                        {{ storeGoods.selectedGood?.category }}
                                    </span>
                                    <h1 class="text-h4 text-weight-bolder text-white q-ma-none">
                                        {{ storeGoods.selectedGood?.name }}
                                    </h1>
                                </div>
                                <q-btn
                                    flat
                                    round
                                    icon="close"
                                    color="grey-6"
                                    class="close-button"
                                    @click="router.back()" />
                            </div>
                            <p class="text-body1 text-grey-4 line-height-relaxed">
                                {{ storeGoods.selectedGood?.description }}
                            </p>
                            <div class="lore-section q-mt-lg">
                                <div
                                    class="text-caption text-secondary text-weight-bolder uppercase">
                                    Artifact Data
                                </div>
                                <p class="text-caption text-grey-6 q-mt-xs q-ma-none italic">
                                    {{ storeGoods.selectedGood?.source }}
                                </p>
                            </div>
                            <div class="action-footer row items-center justify-between q-mt-xl">
                                <div class="price-section">
                                    <span class="text-caption text-grey-7 uppercase block">
                                        Exchange Rate
                                    </span>
                                    <div class="text-h4 text-secondary text-weight-bolder">
                                        {{ storeGoods.selectedGood?.price }}
                                        <span class="text-h6 text-weight-light">Gold</span>
                                    </div>
                                </div>
                                <q-btn
                                    class="stash-button"
                                    unelevated
                                    color="secondary"
                                    text-color="dark"
                                    label="Add to stash"
                                    @click="
                                        storeGoods.selectedGood
                                            ? addToStash(storeGoods.selectedGood)
                                            : null
                                    " />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </q-page>
</template>

<style scoped lang="scss">
#good-details {
    padding-top: 3.125rem;
    padding-bottom: 7.5rem;
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 7.5rem);
    overflow: hidden;
}

.main-wrapper {
    position: relative;
    max-width: 78.75rem;
    width: 100%;
    padding: 0 2rem;
}

.bg-frame {
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: -1;
    width: 100vw;
    height: 100%;
    filter: brightness(0.6) blur(0.125rem);
    opacity: 0.7;
    background-position: center;
    background-size: cover;
    pointer-events: none;
    top: 50%;
    left: 50%;
    mask-image: radial-gradient(
        ellipse at center,
        rgb(0 0 0 / 100%) 0%,
        rgb(0 0 0 / 50%) 40%,
        rgb(0 0 0 / 0%) 85%
    );
}

.bg-workshop {
    background-image: url('src/assets/images/good-details/bg-workshop-details.avif');
}

.bg-black-market {
    background-image: url('src/assets/images/good-details/bg-black-market-details.avif');
}

.details-layout {
    display: grid;
    align-items: start;
    gap: 4rem;
    grid-template-columns: 26.25rem 1fr;

    @media (width <= 64rem) {
        grid-template-columns: 1fr;
        justify-items: center;
    }
}

.product-frame {
    aspect-ratio: 1 / 1;
    width: 100%;
    background: #000;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 0.0625rem solid rgb(255 255 255 / 10%);
}

.product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.content-panel {
    box-shadow: 0 1.875rem 3.75rem rgb(0 0 0 / 50%);
    backdrop-filter: blur(1.875rem) saturate(140%);
    background: rgb(12 12 12 / 80%);
    border: 0.0625rem solid rgb(255 255 255 / 8%);
    border-radius: 0.75rem;
    padding: 3.5rem;
}

.close-button {
    min-width: 2.75rem !important;
    min-height: 2.75rem !important;
    width: 2.75rem !important;
    height: 2.75rem !important;
    background: rgb(255 255 255 / 5%);
    flex-shrink: 0;
    border-radius: 50% !important;
    border: 0.0625rem solid rgb(255 255 255 / 12%);
    padding: 0;
}

.line-height-relaxed {
    line-height: 1.7;
}

.lore-section {
    padding: 1.25rem 1.75rem;
    background: rgb(0 0 0 / 20%);
    border-radius: 0.75rem;
    border-left: 0.125rem solid rgba($secondary, 0.5);
}

.stash-button {
    height: 3.5rem;
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: 0.0625rem;
    box-shadow: 0 0.625rem 1.5625rem rgb(0 0 0 / 30%);
    padding-inline: 3rem;
    border-radius: 0.5rem;
}

.letter-spacing-3 {
    letter-spacing: 0.1875rem;
}

@media (width <= 64rem) {
    .visual-column {
        max-width: 26.25rem;
        width: 100%;
    }

    .content-panel {
        padding: 2.5rem;
    }
}

@media (width <= 37.5rem) {
    .text-h4 {
        font-size: 1.85rem;
    }

    .action-footer {
        flex-direction: column;
        gap: 2rem;
        text-align: center;
    }

    .stash-button {
        width: 100%;
    }
}
</style>
