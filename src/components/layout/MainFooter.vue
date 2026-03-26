<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const isZigzagLoaded = ref(false);
const onImgLoaded = () => {
    isZigzagLoaded.value = true;
};
const quotes = [
    'Not everything that glitters is worth a coin — but Zigzag always has what you need',
    'Some deals are too good for daylight.',
    "If it's hard to find, it's probably here.",
    "Why settle for what's available, when you can have what's exclusive?",
    "A goblin's life is full of risks... and the rewards are always shiny.",
    'Sparks fly, gears grind, and treasure waits for no one!',
    "Better to steal a rat's cheese than beg for scraps.",
    "A goblin's silence is worth more than gold... unless you're buying.",
    'The shadows whisper, but only the brave dare to listen.',
    'A vault is only as strong as its keeper.',
    'Some locks are meant to be opened, some secrets are meant to be kept.',
];
const quote = ref<string>('');
const lastQuoteIdx = ref<number | null>(null);
const randomizeQuote = (): string => {
    if (quotes.length === 0) return '';
    let randIdx = Math.floor(Math.random() * quotes.length);

    if (randIdx === lastQuoteIdx.value) {
        randIdx = Math.floor(Math.random() * quotes.length);
    }
    lastQuoteIdx.value = randIdx;

    return quotes[randIdx] ?? '';
};
const route = useRoute();

watch(
    () => route.name,
    () => {
        quote.value = randomizeQuote();
    },
    { immediate: true },
);
onMounted(() => {
    const img = new Image();

    img.src = new URL('/src/assets/images/footer/zigzag.avif', import.meta.url).href;

    if (img.complete) {
        onImgLoaded();
    } else {
        img.onload = onImgLoaded;
    }
});
</script>

<template>
    <q-footer class="footer relative-position">
        <div class="zigzag">
            <div class="wrapper">
                <q-img
                    class="image"
                    src="~assets/images/footer/zigzag.avif"
                    style="width: 9.375rem; height: 9.375rem"
                    alt="Zigzag"
                    @load="onImgLoaded" />
                <video
                    class="candle"
                    :style="{
                        opacity: isZigzagLoaded ? 1 : 0,
                        transition: 'opacity 0.6s ease-in-out',
                    }"
                    width="1920"
                    height="1080"
                    loop
                    muted
                    autoplay
                    disablePictureInPicture="true"
                    disableRemotePlayback="true"
                    controlslist="nodownload nofullscreen noremoteplayback">
                    <source src="~assets/images/footer/candle.mp4" type="video/mp4" />
                </video>
            </div>
        </div>
        <div class="separator"></div>
        <div
            class="q-px-md"
            style="
                max-width: 48.375rem;
                width: 100%;
                margin-inline: auto;
                text-align: center;
                padding-top: 2.625em;
                padding-bottom: 4.0625em;
            ">
            <Transition name="fade" mode="out-in">
                <q :key="quote" class="quote font-quote text-h6 text-info">
                    <i>{{ quote }}</i>
                </q>
            </Transition>
        </div>
    </q-footer>
</template>

<style lang="scss" scoped>
@use 'sass:map';

.footer {
    z-index: 0;
    background-color: transparent;
}

.zigzag {
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    padding-top: 8.5em;
    padding-bottom: 1.875em;

    &::before {
        content: '';
        position: absolute;
        top: 9.6rem;
        left: calc(50% - 2.95rem);
        transform: translateX(-50%);
        width: 4rem;
        height: 4rem;
        background:
            linear-gradient(oklch(from $dark-page l c h / 23%), oklch(from $dark-page l c h / 23%)),
            url('/src/assets/images/footer/patch.avif');
        background-position: center;
        pointer-events: none;
        mask-image: radial-gradient(circle, rgb(255 255 255) 50%, rgb(255 255 255 / 0%) 100%);
    }
}

.wrapper {
    position: relative;
}

.image {
    width: 9.375rem;
    height: 9.375rem;
    filter: brightness(70%) contrast(93%);
    cursor: pointer;
    transition: filter 0.2s linear;

    &:hover {
        filter: brightness(90%);
    }
}

.candle {
    position: absolute;
    width: 1.875rem;
    height: 1.875rem;
    filter: brightness(110%) blur(0.0437rem);
    object-fit: cover;
    left: 0.9rem;
    top: 3.75rem;
    mix-blend-mode: screen;
    margin-top: 0.5rem;
    pointer-events: none;
}
</style>
