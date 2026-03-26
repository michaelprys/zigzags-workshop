<script setup lang="ts">
import { callToastUtils } from 'src/utils/callToast.utils';
import supabaseApi from 'src/api/supabase.api';
import { ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { QForm } from 'quasar';

const router = useRouter();
const mailbox = ref('');
const vaultKey = ref('');
const isPwd = ref(true);
const pending = ref(false);
const accessVaultForm = useTemplateRef<QForm | null>('access-vault-form');
const accessVault = async () => {
    pending.value = true;
    try {
        const valid = await accessVaultForm.value?.validate();

        if (valid) {
            const { error } = await supabaseApi.auth.signInWithPassword({
                email: mailbox.value,
                password: vaultKey.value,
            });

            if (error) {
                callToastUtils('Wrong vault key or mailbox. Try again', false);
            } else {
                await router.push({ name: 'vault' });
                callToastUtils('Welcome to vault', true);
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
                    :loading="pending"
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
