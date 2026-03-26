<script setup lang="ts">
import { callToastUtils } from 'src/utils/callToast.utils';
import supabaseApi from 'src/api/supabase.api';
import { useRouter } from 'vue-router';
import type { QForm } from 'quasar';
import { ref } from 'vue';

const router = useRouter();
const vaultKey = ref('');
const pending = ref(false);
const isPwd = ref(true);
const setNewKeyForm = ref<QForm | null>(null);
const setNewKey = async () => {
    pending.value = true;
    try {
        if (!setNewKeyForm.value) return;
        const valid = await setNewKeyForm.value.validate();

        if (valid) {
            const { error } = await supabaseApi.auth.updateUser({
                password: vaultKey.value,
            });

            if (error) {
                callToastUtils("Couldn't set a new vault key", false, 'bottom');
            } else {
                callToastUtils('The new vault key has been set', true, 'bottom');
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
        ref="setNewKeyForm"
        class="q-pa-xl"
        @keydown.enter.prevent="setNewKey"
        @submit.prevent="setNewKey">
        <div class="column q-gutter-y-lg">
            <div class="column">
                <h2
                    class="text-h5 text-secondary text-weight-bolder uppercase letter-spacing-1 q-ma-none">
                    Set a new vault key
                </h2>
                <span class="text-grey-5 q-mt-xs">
                    Almost there, come up with a new key and you're set.
                </span>
            </div>
            <div class="column">
                <q-input
                    v-model="vaultKey"
                    :type="isPwd ? 'password' : 'text'"
                    filled
                    dark
                    label-color="primary"
                    input-class="text-primary"
                    label="New vault key *"
                    lazy-rules="ondemand"
                    :rules="[(val) => (val && val.length >= 6) || 'Min 6 characters.']">
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
                    type="submit"
                    :loading="pending"
                    label="Order key"
                    color="secondary"
                    text-color="dark"
                    unelevated
                    class="text-weight-bold q-px-xl"
                    style=" width: 12rem;height: 2.75rem">
                    <template #loading>
                        <q-spinner-hourglass class="on-left" />
                        Ordering...
                    </template>
                </q-btn>
                <RouterLink :to="{ name: 'access-vault' }">
                    <q-btn flat no-caps label="Access vault" color="secondary" />
                </RouterLink>
            </div>
        </div>
    </q-form>
</template>
