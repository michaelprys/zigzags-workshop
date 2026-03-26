<template>
    <section id="purchase-success" class="column flex-center relative-position">
        <div class="column flex-center" style="max-width: 34rem; width: 100%">
            <q-img
                src="~assets/images/stash/success-stash.avif"
                width="64rem"
                height="64rem"
                style="width: 12.5rem; height: 100%; filter: grayscale(0.2); border-radius: 50%" />
            <div class="column flex-center q-mt-xl">
                <span class="text-h4 text-secondary">Deal done!</span>
                <p class="q-mt-md text-center text-primary text-subtitle1">
                    Hah! You got it! Hope yer pockets ain't
                    <br />
                    growin' legs now... Check yer loot, quick!
                </p>
                <q-btn
                    class="q-mt-lg"
                    color="secondary"
                    text-color="dark"
                    unelevated
                    :to="{ name: 'vault' }"
                    label="Open vault"
                    no-caps />
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
#purchase-success {
    padding-bottom: 19em;
    padding-top: 10.5rem;
}
</style>
