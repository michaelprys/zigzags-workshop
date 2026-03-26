<script setup lang="ts">
import IconLoot from 'src/components/icons/IconLoot.vue';

const emit = defineEmits(['toggle-drawer']);
</script>

<template>
    <q-header
        class="header bg-dark-page bg-transparent justify-between q-py-lg relative"
        style="box-shadow: 0 0.25rem 0.625rem rgb(0 0 0 / 50%)">
        <div class="absolute-top fit texture"></div>
        <div class="inner flex items-center justify-between full-width">
            <div class="flex justify-between items-center q-px-md full-width">
                <RouterLink
                    class="logo flex items-center q-gutter-lg q-pl-sm relative-position"
                    to="/">
                    <img
                        class="logo-img"
                        src="~assets/images/common/logo.avif"
                        alt="Zigzag's Workshop logo"
                        loading="eager"
                        fetchpriority="high" />
                    <div class="logo-title-wrapper column font-secondary text-primary">
                        <span class="logo-title-top text-h6">Zigzag's</span>
                        <span class="logo-title-bottom text-h4">Workshop</span>
                    </div>
                </RouterLink>
                <div class="tabs flex q-gutter-lg">
                    <div class="flex items-center q-gutter-x-xl">
                        <q-tabs class="text-subtitle1">
                            <q-route-tab exact class="q-px-lg text-primary" :to="{ name: 'base' }">
                                Base
                            </q-route-tab>
                            <q-route-tab exact class="q-px-lg text-primary" to="/guide">
                                Guide
                            </q-route-tab>
                            <q-route-tab exact class="q-px-lg text-primary" :to="{ name: 'vault' }">
                                Vault
                            </q-route-tab>
                            <q-route-tab
                                exact
                                class="q-px-lg text-primary"
                                :to="{ name: 'workshop' }">
                                Workshop
                            </q-route-tab>
                            <div class="tab">
                                <q-route-tab
                                    exact
                                    class="tab-font font-extra q-px-lg text-secondary text-subtitle2"
                                    :to="{ name: 'black-market' }"
                                    name="black-market">
                                    Black Market
                                </q-route-tab>
                                <div class="tab-animation"></div>
                            </div>
                            <q-route-tab
                                exact
                                :to="{ name: 'stash' }"
                                class="text-subtitle1"
                                unelevated
                                square>
                                <IconLoot class="icon-loot shadow-6" />
                            </q-route-tab>
                        </q-tabs>
                    </div>
                </div>
                <q-btn
                    class="hamburger"
                    size="lg"
                    text-color="primary"
                    dense
                    flat
                    icon="menu"
                    @click="emit('toggle-drawer')" />
            </div>
        </div>
    </q-header>
</template>

<style lang="scss" scoped>
@use 'sass:map';

.logo-img {
    width: 6.8125rem;
    height: 3.875rem;
    margin-bottom: 0.5625rem;
    filter: hue-rotate(335deg) contrast(105%);
}

.hamburger {
    display: none;
}

.icon-loot {
    color: $primary;
}

.texture {
    width: 100%;
    height: 100%;
    filter: brightness(125%);
    background:
        linear-gradient(
            0deg,
            rgb(39 22 11 / 0%) -0.01%,
            rgb(39 22 11 / 0%) 20%,
            rgb(11 5 4 / 66%) 50%,
            rgb(39 22 11 / 82%) 100%
        ),
        linear-gradient(
            9deg,
            #000 -40%,
            rgb(0 0 0 / 0%) 50%,
            rgb(0 0 0 / 0%) 55%,
            rgb(0 0 0 / 0%) 55%,
            #000 170%
        ),
        linear-gradient(0deg, rgb(0 0 0 / 25%) 0%, rgb(0 0 0 / 25%) 100%),
        url('/src/assets/images/common/header-common.webp');
    background-position: 0% 10%;
    background-blend-mode: color, normal, normal, normal, normal;
}

.tab {
    position: relative;

    &:hover {
        .tab-animation {
            transform: scaleX(1);
        }
    }
}

.tab-animation {
    position: absolute;
    transform: scaleX(0);
    transform-origin: top center;
    width: 100%;
    height: 0.125rem;
    background: linear-gradient(90deg, rgb(0 0 0 / 0%) 0%, $warning 50%, rgb(0 0 0 / 0%) 100%);
    transition: transform 0.3s ease-in-out;
    bottom: 0;
    left: 0;
}

@media (width <= $breakpoint-md) {
    .tabs {
        display: none;
    }

    .hamburger {
        display: block;
    }

    .logo-img {
        width: 4.9375rem;
        height: 2.8125rem;
    }

    .logo-title-top {
        font-size: map.get($body1, 'size');
    }

    .logo-title-bottom {
        font-size: map.get($h5, 'size');
    }
}
</style>
