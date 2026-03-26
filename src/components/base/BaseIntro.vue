<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    modelValue: string;
    suggestions: { label: string; value: string }[];
    filterFn: (val: string, doneFn: (callbackFn: () => void) => void, abortFn: () => void) => void;
    goToLink: (val: string) => void;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const localModel = ref(props.modelValue);
const searchVal = ref('');

watch(
    () => props.modelValue,
    (newVal) => {
        localModel.value = newVal;
    },
);

watch(localModel, (val) => {
    emit('update:modelValue', val);
});
</script>

<template>
    <section id="intro">
        <h1 class="sr-only">Introduction</h1>
        <div class="flex flex-center q-px-md">
            <div class="relative-position shadow-8 text-center wrapper">
                <div class="column fit flex-center content-box">
                    <div class="q-px-lg" style="z-index: 10">
                        <h2 class="title text-glow-dark text-h3 text-primary">
                            Time is money, friend!
                        </h2>
                        <h3 class="subtitle q-mt-lg text-h5 text-secondary">
                            I got the best deals anywhere
                        </h3>
                        <q-select
                            v-model="localModel"
                            :options="props.suggestions"
                            class="select q-mt-lg"
                            label-color="info"
                            color="secondary"
                            dark
                            label="Search for goods"
                            use-input
                            hide-selected
                            fill-input
                            input-debounce="500"
                            style="width: 100%"
                            @filter="props.filterFn"
                            @update:model-value="props.goToLink"
                            @filter-input="(val: string) => (searchVal = val)">
                            <template #option="scope">
                                <q-item clickable v-bind="scope.itemProps">
                                    <q-item-section class="text-primary text-left">
                                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </template>
                            <template #no-option>
                                <q-item v-if="searchVal.length >= 2">
                                    <q-item-section class="text-grey text-left">
                                        No treasures found
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </div>
                </div>
                <div class="parallax-wrapper absolute-top fit">
                    <q-parallax class="parallax" :speed="0.5">
                        <template #media>
                            <video
                                class="video"
                                poster="~assets/images/base/poster.avif"
                                loop
                                muted
                                autoplay
                                playsinline>
                                <source src="~assets/images/base/intro.mp4" type="video/mp4" />
                            </video>
                        </template>
                    </q-parallax>
                </div>
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
@use 'sass:map';

#intro {
    padding-top: 5.8em;
    padding-bottom: 8.5em;
}

.wrapper {
    position: relative;
    max-width: 92.5rem;
    width: 100%;
    height: 40rem;
    background-image: url('/src/assets/images/base/poster.avif');
    background-position: center;
    background-size: cover;
    background-color: #0b0504;
    border-radius: $rounded;
    overflow: hidden;
}

.content-box {
    position: relative;
    z-index: 10;
}

.parallax-wrapper {
    z-index: 1;
    pointer-events: none;
}

.parallax {
    height: 100% !important;
}

.video {
    display: block;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    object-fit: cover;
}

@media (width <= $breakpoint-sm) {
    .title {
        font-size: map.get($h4, 'size');
    }

    .subtitle {
        font-size: map.get($body1, 'size');
        margin-top: 0.5rem;
    }
}

@media (width <= 69.4375rem) {
    .parallax-wrapper {
        display: none;
    }
}
</style>
