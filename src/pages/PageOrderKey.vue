<script setup lang="ts">
import { callToast } from 'src/utils/callToast.utils';
import supabaseApi from 'src/api/supabase.api';
import { delay } from 'src/utils/delay.utils';
import { ref, useTemplateRef } from 'vue';
import { QForm } from 'quasar';

const mailbox = ref('');
const pending = ref(false);
const orderKeyForm = useTemplateRef<QForm | null>('order-key-form');
const orderKey = async () => {
    pending.value = true;
    try {
        const valid = await orderKeyForm.value?.validate();

        if (valid) {
            const [{ error }] = await Promise.all([
                supabaseApi.auth.resetPasswordForEmail(mailbox.value, {
                    redirectTo: 'http://localhost:9000/set-new-vault-key',
                }),
                await delay(1500),
            ]);

            if (error) {
                callToast(
                    error ? 'Invalid mailbox format' : 'Something went wrong',
                    false,
                    'bottom',
                );
            } else {
                callToast(
                    "If this mailbox exists in our list, the key's on its way!",
                    true,
                    'bottom',
                );
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        pending.value = false;
        mailbox.value = '';
    }
};
</script>

<template>
    <q-form
        ref="order-key-form"
        class="q-pa-xl"
        @keydown.enter.prevent="orderKey"
        @submit.prevent="orderKey">
        <div class="column q-gutter-y-lg">
            <div class="column">
                <h2
                    class="text-h5 text-secondary text-weight-bolder uppercase letter-spacing-1 q-ma-none">
                    Order a vault key
                </h2>
                <span class="text-grey-5 q-mt-xs">
                    Forgot your key? No worries, we'll get you a new one!
                </span>
            </div>
            <div class="column">
                <q-input
                    v-model="mailbox"
                    filled
                    dark
                    label-color="primary"
                    input-class="text-primary"
                    label="Mailbox *"
                    lazy-rules="ondemand"
                    :rules="[
                        (val) => val.length > 0 || 'Required',
                        (val) => /.+@.+\..+/.test(val) || 'Enter proper mailbox.',
                    ]" />
            </div>
            <div class="row items-center justify-between q-mt-md">
                <q-btn
                    type="submit"
                    :loading="pending"
                    label="Order key"
                    color="secondary"
                    text-color="dark"
                    unelevated
                    class="text-weight-bold q-px-xl"
                    style="width: 12rem; height: 2.75rem">
                    <template #loading>
                        <q-spinner-hourglass class="on-left" />
                        Processing...
                    </template>
                </q-btn>
                <RouterLink :to="{ name: 'access-vault' }">
                    <q-btn flat no-caps label="Access vault" color="secondary" />
                </RouterLink>
            </div>
        </div>
    </q-form>
</template>
