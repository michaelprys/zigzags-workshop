<script setup lang="ts">
import { useStoreInventory } from 'stores/inventory.store';
import { callToast } from 'src/utils/callToast.utils';
import { useStoreAuth } from 'stores/auth.store';
import supabaseApi from 'src/api/supabase.api';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';

interface UserMetadata {
    first_name?: string;
    faction?: string;
}

const storeAuth = useStoreAuth();
const storeInventory = useStoreInventory();
const router = useRouter();
const $q = useQuasar();

const userFaction = ref<string>('outsiders');
const userName = ref<string>('');

const syncUserData = () => {
    const session = storeAuth.session;
    const metadata = session?.user_metadata as UserMetadata | undefined;

    if (!session || !metadata) {
        userFaction.value = 'outsiders';
        userName.value = '';

        return;
    }

    if (metadata.first_name) {
        userName.value = metadata.first_name;
    }

    const factionName = metadata.faction;
    if (factionName === 'Horde') {
        userFaction.value = 'horde';
    } else if (factionName === 'Alliance') {
        userFaction.value = 'alliance';
    } else {
        userFaction.value = 'outsiders';
    }
};

const leaveVault = async () => {
    const { error } = await supabaseApi.auth.signOut();
    if (error) {
        callToast('Unable to leave the vault', false);
    } else {
        await storeAuth.checkSession();
        callToast('Safe travels!', true);
        storeInventory.inventoryGoods = [];
        void router.push({ name: 'access-vault' });
        userFaction.value = 'outsiders';
        userName.value = '';
    }
};

const alertExit = () => {
    $q.dialog({
        title: 'Exit Vault',
        message: 'Are you sure you want to leave your treasures behind?',
        dark: true,
        class: 'custom-modal-card',
        ok: {
            label: 'Yes, Leave',
            color: 'secondary',
            'text-color': 'dark',
            unelevated: true,
            class: 'confirm-btn',
        },
        cancel: { label: 'Cancel', flat: true, color: 'grey-7', class: 'cancel-btn' },
    }).onOk(() => {
        void leaveVault();
    });
};

const getFactionIcon = () => {
    return new URL(`../../assets/images/vault/${userFaction.value}.avif`, import.meta.url).href;
};

watch(() => storeAuth.session, syncUserData, { immediate: true, deep: true });
</script>

<template>
    <div class="header-grid">
        <div class="side-item">
            <Transition name="fade" mode="out-in">
                <img
                    :key="userFaction"
                    :src="getFactionIcon()"
                    class="faction-img cursor-pointer" />
            </Transition>
            <q-tooltip
                :delay="500"
                anchor="bottom right"
                self="center start"
                class="bg-primary column text-center text-dark"
                style="width: 7rem">
                <span
                    class="text-caption text-negative text-weight-bolder uppercase letter-spacing-1">
                    {{ userFaction }}
                </span>
                <span>Faction</span>
            </q-tooltip>
        </div>
        <div class="title-wrapper">
            <h2 class="vault-title q-ma-none text-weight-bold">
                {{ userName || 'Outsider' }}'s Inventory
            </h2>
        </div>
        <div class="side-item justify-end">
            <q-btn
                v-if="storeAuth.session"
                style="border-radius: 0.375rem; padding: 0.5em"
                icon="logout"
                color="primary"
                flat
                dense
                size="md"
                @click="alertExit" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.header-grid {
    display: grid;
    grid-template-columns: 3.75rem 1fr 3.75rem;
    align-items: center;
    border-bottom: 0.0625rem solid rgb(255 255 255 / 8%);
    padding-bottom: 0.75rem;
    width: 100%;
}

.side-item {
    display: flex;
    align-items: center;
    min-height: 2.5rem;
}

.faction-img {
    display: block;
    width: 2.5rem;
    height: 2.5rem;
    filter: drop-shadow(0 0 0.5rem rgba($primary, 0.3));
    object-fit: conver;
    margin-left: 0.6rem;
}

.title-wrapper {
    letter-spacing: 0.0625rem;
    color: $primary;
    text-transform: uppercase;
    text-align: center;
}

.vault-title {
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (width <= 37.5rem) {
    .vault-title {
        font-size: 0.9rem;
    }

    .header-grid {
        grid-template-columns: 2.5rem 1fr 2.5rem;
    }

    .faction-img {
        width: 1.5rem;
        height: 1.875rem;
    }
}
</style>
