<template>
    <div
        class="absolute-bottom fit"
        style="
            z-index: -1;
            opacity: 0.23;
            background-image: url('~assets/images/common/bg.avif');
        "></div>
    <section id="not-found" class="flex flex-center fullscreen q-pa-md text-center text-white">
        <div class="q-px-md">
            <q-img src="~assets/images/not-found/not-found.avif" class="img shadow-4"></q-img>
            <div class="wrapper q-mt-xl">
                <div class="title text-h4">Oops! The path is closed!</div>
                <div class="text q-mt-lg text-h6 text-info">
                    Better turn back before Zigzag spots you.
                </div>
                <q-btn
                    class="q-mt-lg"
                    color="secondary"
                    text-color="dark"
                    unelevated
                    to="/"
                    label="Back to Safety"
                    no-caps />
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
@use 'sass:map';

#not-found {
    padding-bottom: 19em;
    padding-top: 10.5rem;
}

.img {
    width: 15.625rem;
    border-radius: 50%;
}

@media (width <= $breakpoint-sm) {
    .img {
        width: 10rem !important;
    }

    .wrapper {
        max-width: 25rem;
        width: 100%;
        margin-top: 2rem;
    }

    .title {
        font-size: map.get($h5, 'size');
    }

    .text {
        font-size: map.get($subtitle1, 'size');
        margin-top: 0.2rem;
    }
}
</style>
