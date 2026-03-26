<script setup lang="ts">
import { callToast } from 'src/utils/callToast.utils';
import supabaseApi from 'src/api/supabase.api';
import { delay } from 'src/utils/delay.utils';
import { ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { QForm } from 'quasar';

const router = useRouter();
const mailbox = ref('');
const vaultKey = ref('');
const isPwd = ref(true);
const pendingUser = ref(false);
const pendingAnonymousUser = ref(false);
const accessVaultForm = useTemplateRef<QForm | null>('access-vault-form');

const accessVault = async () => {
    pendingUser.value = true;
    try {
        const valid = await accessVaultForm.value?.validate();

        if (valid) {
            const { error } = await supabaseApi.auth.signInWithPassword({
                email: mailbox.value,
                password: vaultKey.value,
            });

            if (error) {
                callToast('Wrong vault key or mailbox. Try again', false);
            } else {
                await router.push({ name: 'vault' });
                callToast('Welcome to vault', true);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await delay(1000);
        pendingUser.value = false;
    }
};

const accessAsGuest = async () => {
    pendingAnonymousUser.value = true;
    try {
        const { error } = await supabaseApi.auth.signInAnonymously();

        if (error) {
            callToast('Guest access failed', false);
        } else {
            await router.push({ name: 'vault' });
            callToast('Welcome, Honorable Guest!', true);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await delay(1000);
        pendingAnonymousUser.value = false;
    }
};
</script>

<template>
    <q-form
        ref="access-vault-form"
        class="q-pa-xl"
        @keydown.enter.prevent="accessVault"
        @submit.prevent="accessVault">
        <div class="column q-gutter-y-lg">
            <div class="column">
                <h2
                    class="text-h5 text-secondary text-weight-bolder uppercase letter-spacing-1 q-ma-none">
                    Access Vault
                </h2>
                <span class="text-grey-5 q-mt-xs">Hey there, stranger!</span>
            </div>

            <q-btn
                :loading="pendingAnonymousUser"
                class="legendary-loot-btn q-py-md text-weight-bolder"
                flat
                @click="accessAsGuest">
                <template #default>
                    <div class="row items-center no-wrap">
                        <q-icon name="auto_awesome" class="q-mr-sm" size="20px" />
                        ENTER AS GUEST
                    </div>
                </template>
                <template #loading>
                    <q-spinner-dots color="black" />
                </template>
            </q-btn>

            <div class="column q-gutter-y-sm">
                <q-input
                    v-model="mailbox"
                    dark
                    filled
                    label="Mailbox *"
                    label-color="primary"
                    input-class="text-primary"
                    lazy-rules="ondemand"
                    :rules="[(val) => val.length > 0 || 'Required']" />
                <q-input
                    v-model="vaultKey"
                    :type="isPwd ? 'password' : 'text'"
                    dark
                    filled
                    label="Vault key *"
                    label-color="primary"
                    input-class="text-primary"
                    lazy-rules="ondemand"
                    :rules="[(val) => val.length >= 6 || 'Min 6 characters']">
                    <template #append>
                        <q-icon
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwd = !isPwd" />
                    </template>
                </q-input>
            </div>
            <div class="row items-center justify-between q-mt-md">
                <q-btn
                    :loading="pendingUser"
                    type="submit"
                    label="Open"
                    color="secondary"
                    text-color="dark"
                    unelevated
                    class="text-weight-bold q-px-xl"
                    style="height: 2.75rem">
                    <template #loading>
                        <q-spinner-hourglass />
                    </template>
                </q-btn>
                <div class="row gap-sm">
                    <q-btn
                        flat
                        no-caps
                        label="Forgot key?"
                        color="grey-6"
                        :to="{ name: 'order-key' }" />
                    <q-btn
                        flat
                        no-caps
                        label="Set up Vault"
                        color="secondary"
                        :to="{ name: 'setup-vault' }" />
                </div>
            </div>
        </div>
    </q-form>
</template>

<style scoped>
.legendary-loot-btn {
    position: relative;
    letter-spacing: 1px;
    box-shadow: 0 0 15px rgb(255 215 0 / 40%);
    background: linear-gradient(45deg, #a67c00, #ffdc73, #bf9b30, #ffdc73, #a67c00);
    background-size: 400% 400%;
    color: #1a1a1a;
    animation:
        gold-shimmer 5s ease infinite,
        legendary-pulse 3s infinite;
    transition: all 0.3s ease;
    border: 1px solid rgb(166 124 0 / 30%);
    border-radius: 8px;
    overflow: hidden;
}

.legendary-loot-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 25px rgb(255 215 0 / 60%);
    border-color: rgb(166 124 0 / 60%);
}

@keyframes gold-shimmer {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

@keyframes legendary-pulse {
    0% {
        box-shadow:
            0 0 10px rgb(255 215 0 / 30%),
            inset 0 0 5px rgb(255 255 255 / 10%);
    }

    50% {
        box-shadow:
            0 0 20px rgb(255 215 0 / 50%),
            inset 0 0 15px rgb(255 255 255 / 30%);
    }

    100% {
        box-shadow:
            0 0 10px rgb(255 215 0 / 30%),
            inset 0 0 5px rgb(255 255 255 / 10%);
    }
}

.legendary-loot-btn::after {
    position: absolute;
    width: 200%;
    height: 200%;
    filter: blur(12px);
    opacity: 0.8;
    background: radial-gradient(
        circle at center,
        rgb(255 255 255 / 60%) 0%,
        rgb(255 255 255 / 20%) 20%,
        transparent 50%
    );
    pointer-events: none;
    animation: lens-flare 5s infinite linear;
    content: '';
    top: -50%;
    left: -50%;
}

@keyframes lens-flare {
    from {
        transform: rotate(0deg) translateX(20%);
    }

    to {
        transform: rotate(360deg) translateX(20%);
    }
}
</style>
