<script setup lang="ts">
import { useManageStash } from 'src/composables/useManageStash';
import { useMoveImage } from 'src/composables/useMoveImage';
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreGoods } from 'stores/goods.store';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, computed } from 'vue';

const route = useRoute();
const router = useRouter();
const storeGoods = useStoreGoods();
const storeInventory = useStoreInventory();
const { addToStash } = useManageStash();

const imgRef = ref<HTMLImageElement | null>(null);
const isLoaded = ref(false);
const imgLoading = ref(true);

const currentGood = computed(() => storeGoods.selectedGood);
const isAuth = computed(() => currentGood.value?.requires_access ?? false);

const moveImage = (e: MouseEvent) => {
    if (imgRef.value) {
        const { moveImage: move } = useMoveImage(imgRef.value);
        move(e);
    }
};

const resetImage = () => {
    if (imgRef.value) {
        const { resetImage: reset } = useMoveImage(imgRef.value);
        reset();
    }
};

onMounted(async () => {
    await storeInventory.checkInvitation();
    const slug = route.params.slug as string;
    const data = await storeGoods.loadGoodBySlug(slug);

    if (!data) {
        await router.push({ name: 'black-market-access' });

        return;
    }

    storeGoods.selectGood(data);
    isLoaded.value = true;
});
</script>

<template>
    <q-page class="good-details-page">
        <Transition name="fade" mode="out-in">
            <section id="good-details" v-if="isLoaded" key="content">
                <div class="main-wrapper">
                    <div class="bg-frame" :class="isAuth ? 'bg-black-market' : 'bg-workshop'"></div>
                    <div class="details-layout">
                        <div class="visual-column">
                            <div class="product-frame shadow-24">
                                <div
                                    v-if="imgLoading"
                                    class="absolute-full flex flex-center custom-loader">
                                    <q-spinner-dots color="secondary" size="3rem" />
                                </div>
                                <img
                                    ref="imgRef"
                                    class="product-img"
                                    :class="{ 'img-hidden': imgLoading }"
                                    :src="currentGood?.image_url || ''"
                                    @mousemove="moveImage"
                                    @mouseleave="resetImage"
                                    @load="imgLoading = false" />
                            </div>
                        </div>
                        <div class="info-column">
                            <div class="content-panel">
                                <div class="row justify-between no-wrap q-mb-md items-start">
                                    <div class="column">
                                        <span
                                            class="text-overline text-secondary text-weight-bolder letter-spacing-3">
                                            {{ currentGood?.category }}
                                        </span>
                                        <h1 class="text-h4 text-weight-bolder text-white q-ma-none">
                                            {{ currentGood?.name }}
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
                                    {{ currentGood?.description }}
                                </p>
                                <div class="lore-section q-mt-lg">
                                    <div
                                        class="text-caption text-secondary text-weight-bolder uppercase">
                                        Artifact Data
                                    </div>
                                    <p class="text-caption text-grey-6 q-mt-xs q-ma-none italic">
                                        {{ currentGood?.source }}
                                    </p>
                                </div>
                                <div class="action-footer row items-center justify-between q-mt-xl">
                                    <div class="price-section">
                                        <span class="text-caption text-grey-7 uppercase block">
                                            Exchange Rate
                                        </span>
                                        <div class="text-h4 text-secondary text-weight-bolder">
                                            {{ currentGood?.price }}
                                            <span class="text-h6 text-weight-light">Gold</span>
                                        </div>
                                    </div>
                                    <q-btn
                                        class="stash-button"
                                        unelevated
                                        color="secondary"
                                        text-color="dark"
                                        label="Add to stash"
                                        @click="currentGood ? addToStash(currentGood) : null" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div v-else class="loading-container column flex-center" key="loader">
                <q-spinner-hourglass color="secondary" size="4rem" />
                <div class="text-h6 text-secondary q-mt-md uppercase letter-spacing-2">
                    Loading your item...
                </div>
            </div>
        </Transition>
    </q-page>
</template>

<style scoped lang="scss">
.good-details-page {
    display: flex;
    flex-direction: column;
}

#good-details {
    flex-grow: 1;
    padding-top: 3.125rem;
    padding-bottom: 7.5rem;
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 1;
    overflow: hidden;
}

.loading-container {
    flex-grow: 1;
    width: 100%;
    min-height: calc(100vh - 10rem);
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
        #fff 0%,
        rgba(255, 255, 255, 0.5) 40%,
        transparent 85%
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
    position: relative;
    aspect-ratio: 1 / 1;
    width: 100%;
    background: transparent !important;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 0.0625rem solid rgba(255, 255, 255, 0.1);
}

.custom-loader {
    z-index: 1;
    background: rgba(255, 255, 255, 0.02);
}

.product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.1s ease;
    &.img-hidden {
        opacity: 0;
    }
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
    background: rgb(255 255 255 / 5%);
    border-radius: 50% !important;
    border: 0.0625rem solid rgb(255 255 255 / 12%);
}

.stash-button {
    height: 3.5rem;
    font-size: 1rem;
    font-weight: 900;
    padding-inline: 3rem;
    border-radius: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
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
