<script setup lang="ts">
import { callToastUtils } from 'src/utils/callToast.utils';
import supabaseApi from 'src/api/supabase.api';
import { ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import type { QForm } from 'quasar';

const router = useRouter();
const setupVaultForm = useTemplateRef<QForm>('setup-vault-form');
const name = ref('');
const mailbox = ref('');
const vaultKey = ref('');
const vaultConfirmKey = ref('');
const faction = ref(null);
const isPwd = ref(true);
const isPwdConfirm = ref(true);
const pending = ref(false);
const factions = ['Horde', 'Alliance', 'No faction (Outsiders)'];
const setupVault = async () => {
    pending.value = true;
    try {
        const valid = await setupVaultForm.value?.validate();

        if (valid) {
            const { error } = await supabaseApi.auth.signUp({
                email: mailbox.value,
                password: vaultKey.value,
                options: {
                    data: {
                        first_name: name.value,
                        faction: faction.value,
                    },
                },
            });

            if (error) {
                callToastUtils(
                    error ? 'This vault is already claimed' : 'Something went wrong',
                    false,
                );
            } else {
                callToastUtils('Success! Please, check your mailbox', true);
                await router.push({ name: 'access-vault' });
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        pending.value = false;
    }
};
</script>

<template>
    <q-form
        ref="setup-vault-form"
        class="q-pa-xl"
        @keydown.enter.prevent="setupVault"
        @submit.prevent="setupVault">
        <div class="column q-gutter-y-lg">
            <div class="column">
                <h2
                    class="text-h5 text-secondary text-weight-bolder uppercase letter-spacing-1 q-ma-none">
                    Set up vault
                </h2>
                <span class="text-grey-5 q-mt-xs">Let's set up your vault for safe keeping.</span>
            </div>
            <div class="column q-gutter-y-sm">
                <q-input
                    v-model="name"
                    dark
                    filled
                    label="True name *"
                    label-color="primary"
                    input-class="text-primary"
                    lazy-rules="ondemand"
                    :rules="[(val) => val.length > 0 || 'Required']" />
                <q-input
                    v-model="mailbox"
                    dark
                    filled
                    label="Mailbox *"
                    label-color="primary"
                    input-class="text-primary"
                    lazy-rules="ondemand"
                    :rules="[
                        (val) => val.length > 0 || 'Required',
                        (val) => /.+@.+\..+/.test(val) || 'Enter proper mailbox.',
                    ]" />
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
                <q-input
                    v-model="vaultConfirmKey"
                    :type="isPwdConfirm ? 'password' : 'text'"
                    dark
                    filled
                    label="Confirm vault key *"
                    label-color="primary"
                    input-class="text-primary"
                    lazy-rules="ondemand"
                    :rules="[(val) => val === vaultKey || 'Keys must match']">
                    <template #append>
                        <q-icon
                            :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwdConfirm = !isPwdConfirm" />
                    </template>
                </q-input>
                <q-select
                    v-model="faction"
                    :options="factions"
                    dark
                    filled
                    label="Your faction *"
                    label-color="primary"
                    input-class="text-primary"
                    lazy-rules="ondemand"
                    :rules="[(val) => !!val || 'Required']" />
            </div>
            <div class="row items-center justify-between q-mt-md">
                <q-btn
                    type="submit"
                    label="Set up"
                    color="secondary"
                    text-color="dark"
                    unelevated
                    class="text-weight-bold q-px-xl"
                    style="width: 12rem; height: 2.75rem"
                    :loading="pending">
                    <template #loading>
                        <q-spinner-hourglass class="on-left" />
                        Setting up...
                    </template>
                </q-btn>
                <RouterLink :to="{ name: 'access-vault' }">
                    <q-btn flat no-caps label="Access vault" color="secondary" />
                </RouterLink>
            </div>
        </div>
    </q-form>
</template>
