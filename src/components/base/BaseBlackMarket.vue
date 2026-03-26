<script setup lang="ts"></script>

<template>
    <section id="black-market">
        <h1 class="sr-only">The Black Market</h1>
        <div class="flex flex-center q-px-md">
            <div class="content">
                <q-img class="image shadow-8" src="~assets/images/base/black-market.avif" />
                <div class="inner">
                    <h2 class="title text-h3">Goblin Black Market</h2>
                    <div class="q-mt-lg text-info">
                        <p class="text text-subtitle1">
                            All shiny stuff from the Black Market come with
                            <i class="text-primary">zero</i>
                            guarantees! Not deadly (well,
                            <i>mostly</i>
                            ), but these trinkets pack wild surprises that'll leave ya cacklin' or
                            cryin'! The Black Market ain't for softlings — it's where power beyond
                            imagining waits clever (or crazy) enough to snatch it! But don't worry,
                            if you just want somethin' useful, we've got treasures for every sneaky,
                            greedy, grubby need!
                        </p>
                        <p class="warning q-mt-md text-caption text-negative">
                            Warning: Enter at your own risk! Once ya buy somethin', it's yours — no
                            refunds. And don't bother tryin' to haggle!
                        </p>
                        <RouterLink class="link" :to="{ name: 'black-market-access' }">
                            <q-btn class="btn q-mt-md text-subtitle1" outline color="secondary">
                                Get invitation
                            </q-btn>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
@use 'sass:map';

#black-market {
    position: relative;
    padding-top: 9.8125em;
    padding-bottom: 8.5em;
}

.content {
    display: flex;
    max-width: 87.5rem;
    gap: 2.8rem;
    border-radius: $rounded;
}

.inner {
    width: 55%;
}

.image {
    width: 45%;
    border-radius: $rounded;
}

@media (width <= $breakpoint-md) {
    .title {
        font-size: map.get($h4, 'size');
    }

    .subtitle {
        font-size: map.get($body1, 'size');
        margin-top: 0.5rem;
    }

    .content {
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .inner {
        max-width: 50rem;
        width: 100%;
    }

    .image {
        max-width: 40rem;
        width: 100%;
    }

    .link {
        margin-inline: auto;
        display: flex;
        justify-content: center;
        margin-top: 2rem;
    }

    .btn {
        max-width: 20rem;
        width: 100%;
    }
}

@media (width <= $breakpoint-xs) {
    .btn {
        max-width: 100%;
        width: 100%;
    }
}
</style>
