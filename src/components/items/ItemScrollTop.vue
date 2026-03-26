<script setup lang="ts">
import IconArrow from 'src/components/icons/IconArrow.vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const isCrossed = ref(false);
const handleScroll = () => {
    isCrossed.value = window.scrollY >= 360;
};
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleScroll();
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});
onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <q-btn
        flat
        class="scroll-top-btn"
        :class="{ 'is-crossed': isCrossed, 'is-not-crossed': !isCrossed }"
        aria-label="Go to the beginning of the page"
        @click="scrollToTop">
        <IconArrow />
        <div class="btn-glow"></div>
    </q-btn>
</template>

<style lang="scss" scoped>
.scroll-top-btn {
    position: fixed;
    z-index: 300;
    min-height: unset;
    width: 3rem;
    height: 3rem;
    box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 40%);
    backdrop-filter: blur(0.625rem);
    background: linear-gradient(135deg, rgb(40 40 40 / 60%) 0%, rgb(20 20 20 / 80%) 100%);
    color: $primary;
    transition:
        transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        background-color 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    bottom: 3.5rem;
    right: 3rem;
    padding: 0;
    border: 0.0625rem solid rgb(255 255 255 / 8%);
    border-radius: 0.5rem;
    overflow: hidden;

    & svg {
        position: relative;
        z-index: 2;
        width: 1.2rem;
        height: 1.2rem;
        transition: transform 0.3s ease;
    }

    .btn-glow {
        position: absolute;
        inset: 0;
        z-index: 1;
        opacity: 0;
        background: radial-gradient(circle at center, rgba($primary, 0.15) 0%, transparent 70%);
        transition: opacity 0.3s ease;
    }

    &:hover {
        box-shadow:
            0 0 1.25rem rgba($primary, 0.15),
            0 0.625rem 1.5625rem rgb(0 0 0 / 50%);
        background-color: rgb(45 45 45 / 90%);
        border-color: rgba($primary, 0.4);

        & svg {
            transform: translateY(-0.125rem);
            color: $secondary;
        }

        .btn-glow {
            opacity: 1;
        }
    }

    &.is-crossed {
        transform: translateY(0) scale(1);
        pointer-events: all;
    }

    &.is-not-crossed {
        transform: translateY(6rem) scale(0.8);
        opacity: 0;
        pointer-events: none;
    }
}

@media (max-width: $breakpoint-xs) {
    .scroll-top-btn {
        right: 1.5rem;
        bottom: 2rem;
        width: 2.5rem;
        height: 2.5rem;
    }
}
</style>
