<script lang="ts" setup>
import { usePaginatedInventoryGoods } from 'src/composables/usePaginatedInventoryGoods';
import { useStoreInventory } from 'stores/inventory.store';
import { vDraggable } from 'vue-draggable-plus';
import { useQuasar } from 'quasar';
import { computed } from 'vue';

interface InventoryItem {
    good_id: number;
    quantity: number;
    goods: {
        name: string;
        short_description: string;
        image_url: string;
    };
}

interface DraggableEvent {
    newIndex: number;
    oldIndex: number;
}

const storeInventory = useStoreInventory();
const { updateGoodSlot, removeGoodFromInventory } = storeInventory;
const { inventoryGoodsPerPage, loadPaginatedInventoryGoods } = usePaginatedInventoryGoods();
const inventoryGoods = computed<InventoryItem[]>(() => storeInventory.inventoryGoods);
const $q = useQuasar();

const handleRemoveItem = (selectedGoodId: number) => {
    $q.dialog({
        title: 'Remove Item',
        message: 'This action is irreversible. Destroy this treasure?',
        dark: true,
        class: 'custom-modal-card',
        ok: {
            label: 'Yes, Destroy',
            color: 'secondary',
            'text-color': 'dark',
            unelevated: true,
            class: 'confirm-btn',
        },
        cancel: {
            label: 'Keep it',
            flat: true,
            color: 'grey-7',
            class: 'cancel-btn',
        },
    }).onOk(() => {
        void (async () => {
            try {
                await removeGoodFromInventory(selectedGoodId);
                await loadPaginatedInventoryGoods();
            } catch (err) {
                console.error(err);
            }
        })();
    });
};

const handleSlots = async (event: DraggableEvent) => {
    const item = inventoryGoods.value[event.newIndex];
    if (item) {
        await updateGoodSlot(item.good_id, event.newIndex + 1);
        await loadPaginatedInventoryGoods();
    }
};
</script>

<template>
    <ul
        v-draggable="[
            inventoryGoods,
            {
                animation: 150,
                onUpdate: (event: DraggableEvent) => {
                    void handleSlots(event);
                },
            },
        ]"
        class="q-mt-lg slots">
        <template v-for="(slot, idx) in inventoryGoodsPerPage" :key="idx">
            <li class="slot">
                <div class="placeholder"></div>
                <Transition name="remove" appear>
                    <div
                        v-if="inventoryGoods[idx] && inventoryGoods[idx].goods"
                        class="full-height full-width relative-position">
                        <q-tooltip
                            :delay="500"
                            anchor="bottom right"
                            self="center start"
                            class="bg-primary column text-center text-dark"
                            style="width: 11.25rem">
                            <span class="text-caption text-negative text-weight-bold">
                                {{ inventoryGoods[idx].goods.name }}
                            </span>
                            <span>{{ inventoryGoods[idx].goods.short_description }}</span>
                        </q-tooltip>
                        <q-btn
                            class="btn-close"
                            dense
                            flat
                            size="xs"
                            icon="close"
                            @click.stop="handleRemoveItem(inventoryGoods[idx].good_id)" />
                        <div class="quantity">
                            {{ inventoryGoods[idx].quantity }}
                        </div>
                        <q-img
                            class="img"
                            :src="inventoryGoods[idx].goods.image_url"
                            transition="fade"
                            :duration="1000"
                            style="width: 100%; height: 100%">
                            <template #loading>
                                <q-skeleton
                                    type="rect"
                                    dark
                                    animated
                                    class="full-height full-width"
                                    style="background: rgb(255 255 255 / 8%)" />
                            </template>
                        </q-img>
                    </div>
                </Transition>
            </li>
        </template>
    </ul>
</template>

<style lang="scss">
.custom-modal-card.q-dialog-plugin {
    box-shadow: 0 1.875rem 3.75rem rgb(0 0 0 / 70%) !important;
    background:
        radial-gradient(circle at top left, rgb(255 255 255 / 3%) 0%, transparent 40%),
        linear-gradient(180deg, #161616 0%, #0d0d0d 100%) !important;
    border: 0.0625rem solid rgb(255 255 255 / 10%) !important;
    border-radius: 1rem !important;
    padding: 1.5rem !important;

    .q-dialog__title {
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: 0.0625rem;
        color: $secondary;
        text-transform: uppercase;
    }

    .q-dialog__message {
        font-size: 0.95rem;
        color: #888;
        margin-top: 0.5rem;
    }

    .q-card__actions {
        padding-top: 2rem;
        gap: 1rem;

        .confirm-btn {
            flex-grow: 1;
            height: 2.75rem;
            font-weight: 800;
            border-radius: 0.375rem;
        }

        .cancel-btn {
            height: 2.75rem;
            font-weight: 700;
            border-radius: 0.375rem;
            padding-inline: 1.5rem;
        }
    }
}
</style>

<style lang="scss" scoped>
@use 'sass:map';

.slots {
    display: grid;
    place-items: center;
    width: fit-content;
    margin-inline: auto;
    gap: 1rem;
    grid-template-columns: repeat(11, 5.25rem);
    padding-left: 0;
    list-style: none;

    @media (width <= 75rem) {
        grid-template-columns: repeat(8, 5.25rem);
    }
    @media (width <= 61.25rem) {
        grid-template-columns: repeat(6, 5.25rem);
    }
    @media (width <= $breakpoint-sm) {
        grid-template-columns: repeat(5, 5.25rem);
    }
    @media (width <= $breakpoint-xs) {
        grid-template-columns: repeat(3, 5.25rem);
    }
}

.slot {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 5.25rem;
    height: 5.25rem;
    box-shadow: 0 0.25rem 0.625rem rgb(0 0 0 / 70%);
    cursor: pointer;
    padding: 0.15rem;
    border-radius: 0.375rem;
    overflow: hidden;

    &:hover {
        box-shadow: 0 0.0625rem 0.75rem rgb(92 90 78 / 60%);
    }
}

.btn-close {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 5;
    background-color: rgb(23 23 23);
}

.quantity {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    z-index: 4;
    height: 1.0625rem;
    font-size: 0.75rem;
    color: $primary;
    background-color: $dark;
    user-select: none;
    bottom: 0.25rem;
    right: 0.25rem;
    padding-inline: 0.25em;
    border-radius: 0.15rem;
    border: 0.0625rem solid rgb(255 255 255 / 10%);
}

.placeholder {
    position: absolute;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 0 0.375rem rgb(0 0 0 / 80%);
    background: linear-gradient(145deg, rgb(45 45 45 / 70%), rgb(25 25 25 / 90%));
    transition:
        border-color 0.15s,
        box-shadow 0.15s;
    border-radius: 0.375rem;
    border: 0.0625rem solid rgb(255 255 255 / 5%);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top left, rgb(255 255 255 / 20%), transparent);
        border-radius: 0.375rem;
    }
}

.img {
    position: absolute;
    z-index: 2;
    width: 100%;
    height: 100%;
    filter: contrast(95%) brightness(95%);
    user-select: none;
    top: 0;
    left: 0;
    border-radius: 0.375rem;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 0.375rem;
        z-index: 3;
    }
}
</style>
