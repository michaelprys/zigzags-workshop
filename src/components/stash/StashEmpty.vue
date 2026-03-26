<script setup lang="ts"></script>

<template>
    <Transition name="stash-fade" appear>
        <section id="empty-stash" class="column flex-center q-pa-md">
            <div class="container column flex-center">
                <div class="img-wrapper relative-position">
                    <div class="glow-effect"></div>
                    <q-img
                        class="empty-img"
                        src="~assets/images/stash/empty-stash.avif"
                        fit="contain"
                        height="11.25rem"
                        width="11.25rem">
                        <template #loading>
                            <div class="glow-effect placeholder-glow"></div>
                        </template>
                    </q-img>
                </div>
                <div class="content-wrapper column flex-center q-mt-xl text-center">
                    <h1
                        class="title text-h4 text-secondary text-weight-bold uppercase letter-spacing-2 q-ma-none">
                        Your stash is dry
                    </h1>
                    <p class="text q-mt-md text-primary text-subtitle1">
                        Hey, what gives?! Go fetch some treasures so we ain't walkin' around with
                        nothin'!
                    </p>
                    <q-btn
                        class="btn-explore q-mt-lg q-px-xl"
                        color="secondary"
                        text-color="dark"
                        unelevated
                        size="md"
                        :to="{ name: 'workshop' }"
                        label="Explore goods"
                        no-caps />
                </div>
            </div>
        </section>
    </Transition>
</template>

<style lang="scss" scoped>
#empty-stash {
    min-height: calc(100vh - 6.25rem);
}

.container {
    max-width: 31.25rem;
    width: 100%;
}

.img-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    width: 11.25rem;
    height: 11.25rem;
}

.glow-effect {
    position: absolute;
    z-index: -1;
    width: 9.375rem;
    height: 9.375rem;
    background: radial-gradient(circle, rgba($secondary, 0.15) 0%, transparent 70%);
    pointer-events: none;
    border-radius: 50%;
}

.placeholder-glow {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba($secondary, 0.1) 0%, transparent 60%);
    animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        opacity: 0.5;
    }

    50% {
        transform: scale(1.05);
        opacity: 1;
    }

    100% {
        transform: scale(0.95);
        opacity: 0.5;
    }
}

.empty-img {
    position: relative;
    filter: grayscale(0.2) drop-shadow(0 0.625rem 1.25rem rgb(0 0 0 / 40%));
}

.content-wrapper {
    width: 100%;
}

.letter-spacing-2 {
    letter-spacing: 0.125rem;
}

.stash-fade-enter-active {
    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.stash-fade-enter-from {
    transform: translateY(0.9375rem);
    opacity: 0;
}

@media (width <= 37.5rem) {
    .title {
        font-size: 1.75rem;
    }

    .text {
        font-size: 1rem;
    }

    .img-wrapper,
    .empty-img {
        width: 8.75rem !important;
        height: 8.75rem !important;
    }

    .glow-effect {
        width: 6.875rem;
        height: 6.875rem;
    }
}
</style>
