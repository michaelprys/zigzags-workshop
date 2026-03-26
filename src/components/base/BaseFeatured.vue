<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { delayUtils } from 'src/utils/delay.utils';
import { useStoreGoods } from 'stores/goods.store';
import { useQuery } from '@pinia/colada';

type Good = {
    id: number;
    name: string;
    image_url: string;
};

const storeGoods = useStoreGoods();
const activeSlide = ref(1);
const { data: queryData } = useQuery<Good[] | undefined>({
    key: ['featuredGoods'],
    query: () => storeGoods.loadFeaturedGoods(),
    staleTime: 1000 * 60 * 5,
});
const slideGroup = computed(() => {
    const img = queryData.value ?? [];

    return [
        [img[4], img[3], img[8]],
        [img[0], img[1], img[2]],
        [img[5], img[6], img[7]],
    ];
});
const imgLoaded = ref<Record<number, boolean>>({});

watch(
    () => queryData.value,
    (newQuery) => {
        if (!newQuery) return;
        newQuery.forEach((good) => {
            const img = new Image();

            img.onload = async () => {
                if (img.complete) {
                    imgLoaded.value[good.id] = true;
                } else {
                    await delayUtils(200);
                    imgLoaded.value[good.id] = true;
                }
            };
            img.src = good.image_url;
        });
    },
    { immediate: true },
);
const isAutoplaying = ref(false);
const toggleAutoplay = () => {
    isAutoplaying.value = window.innerWidth > 1111;
};

watchEffect(() => {
    toggleAutoplay();
});
window.addEventListener('resize', toggleAutoplay);
onBeforeUnmount(() => {
    window.removeEventListener('resize', toggleAutoplay);
});
</script>

<template>
    <section id="featured">
        <h1 class="sr-only">Featured</h1>
        <div class="wrapper flex flex-center q-px-md">
            <div>
                <div class="text-center">
                    <h2 class="title text-glow-dark text-h3 text-primary">You want it?</h2>
                    <h3 class="subtitle q-my-lg text-h5 text-secondary">
                        It's yours... for a price!
                    </h3>
                </div>
                <div class="q-pa-md">
                    <q-carousel
                        v-model="activeSlide"
                        class="carousel bg-transparent non-selectable"
                        transition-prev="slide-right"
                        transition-next="slide-left"
                        swipeable
                        animated
                        control-color="secondary"
                        padding
                        navigation
                        :autoplay="isAutoplaying"
                        infinite
                        arrows
                        height="24rem">
                        <q-carousel-slide
                            v-for="(slide, idx) in slideGroup"
                            :key="idx"
                            :name="idx + 1"
                            class="slide cursor-pointer no-wrap">
                            <div class="slide-inner fit items-center row">
                                <div
                                    v-for="(img, imgIdx) in slide"
                                    :key="imgIdx + 1"
                                    class="slide-content relative full-height"
                                    :class="imgIdx === 1 ? 'col-5' : 'col'">
                                    <div style="position: relative; height: 100%">
                                        <q-skeleton
                                            v-if="img?.id && !imgLoaded[img.id]"
                                            class="skeleton"
                                            animation="wave"
                                            animation-speed="1800"
                                            dark
                                            square
                                            :style="imgIdx === 1 ? 'col-5' : 'col'"></q-skeleton>
                                        <q-img
                                            :src="img?.image_url"
                                            :alt="img?.name"
                                            class="image full-height inner shadow-1" />
                                    </div>
                                </div>
                            </div>
                        </q-carousel-slide>
                    </q-carousel>
                </div>
            </div>
        </div>
    </section>
    <div class="divider"></div>
</template>

<style lang="scss" scoped>
@use 'sass:map';

#featured {
    padding-top: 6.625em;
    padding-bottom: 8.5em;
}

:deep(.q-carousel__control) {
    margin-top: -2rem;
}

.wrapper {
    overflow: hidden;
}

.carousel {
    width: 81.25rem !important;
}

.slide-content {
    margin-right: 1rem;
    border-radius: $rounded;

    &:last-child {
        margin-right: 0;
    }

    & .q-img {
        border-radius: $rounded !important;
    }
}

.skeleton {
    position: absolute;
    inset: 0;
    background-color: $placeholder-secondary;
    border-radius: $rounded;
}

.image {
    border-radius: $rounded;
}

@media (width <= $breakpoint-md) {
    #featured {
        padding-bottom: 5em;
    }

    .title {
        font-size: map.get($h4, 'size');
    }

    .subtitle {
        font-size: map.get($body1, 'size');
        margin-top: 0.5rem;
    }

    :deep(.q-field__label) {
        font-size: map.get($body2, 'size');
    }
}

@media (width <= 81.25rem) {
    .carousel {
        width: 75rem !important;
        padding-inline: 2.375rem;
    }
}
</style>
