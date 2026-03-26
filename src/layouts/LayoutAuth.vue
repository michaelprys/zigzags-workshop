<template>
    <q-page class="auth-layout flex flex-center">
        <div class="auth-container q-px-md">
            <div class="vault-card shadow-24">
                <router-view />
            </div>
        </div>
    </q-page>
</template>

<style lang="scss" scoped>
.auth-layout {
    min-height: calc(100vh - 7.5rem);
    padding-top: 4em;
    padding-bottom: 14rem;
}

.auth-container {
    max-width: 42rem;
    width: 100%;
}

.vault-card {
    position: relative;
    box-shadow: 0 1.875rem 3.75rem rgb(0 0 0 / 60%);
    background: linear-gradient(180deg, #181818 0%, #0d0d0d 100%);
    border: 0.0625rem solid rgb(255 255 255 / 10%);
    border-radius: 0.75rem;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
            circle at top left,
            rgb(255 255 255 / 4%) 0%,
            transparent 70%
        );
        pointer-events: none;
    }
}
</style>
