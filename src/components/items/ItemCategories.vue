<script setup lang="ts">
import { type Category } from 'src/types/types';

defineProps<{
    categories: Category[];
    resetCategories: () => void;
    updateSelectedCategories: () => void;
}>();
</script>

<template>
    <div class="filter-wrapper q-px-md q-mt-lg">
        <div class="filter-container">
            <q-btn flat no-caps class="all-btn" label="All Categories" @click="resetCategories" />
            <div class="separator hide-mobile"></div>
            <div class="categories-grid">
                <div
                    v-for="(category, idx) in categories"
                    :key="idx"
                    class="category-item"
                    :class="{ 'is-active': category.active }"
                    @click="
                        category.active = !category.active;
                        updateSelectedCategories();
                    ">
                    <q-checkbox
                        v-model="category.active"
                        :label="category.label"
                        size="sm"
                        dense
                        dark
                        color="secondary"
                        class="text-capitalize custom-checkbox"
                        @click.stop
                        @update:model-value="updateSelectedCategories" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.filter-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
}

.filter-container {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 0.625rem 2.5rem rgb(0 0 0 / 50%);
    backdrop-filter: blur(0.9375rem);
    background: linear-gradient(180deg, rgb(255 255 255 / 5%) 0%, rgb(0 0 0 / 20%) 100%);
    padding: 0.5rem 1.5rem;
    border-radius: 6.25rem;
    border: 0.0625rem solid rgb(255 255 255 / 10%);
}

.separator {
    width: 0.0625rem;
    height: 1.25rem;
    background: rgb(255 255 255 / 10%);
}

.categories-grid {
    display: flex;
    gap: 1rem;
}

.category-item {
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    border: 0.0625rem solid transparent;

    &:hover {
        background: rgb(255 255 255 / 3%);
    }

    &.is-active {
        background: rgba($secondary, 0.08);
        border-color: rgba($secondary, 0.3);
    }
}

.all-btn {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.0625rem;
    color: $primary;
    text-transform: uppercase;
}

:deep(.q-checkbox__label) {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.03125rem;
    color: $primary;
    text-transform: uppercase;
}

@media (width <= 56.25rem) {
    .filter-container {
        flex-direction: column;
        max-width: 27.5rem;
        width: 100%;
        border-radius: 1rem;
        padding: 1rem;
        gap: 0.5rem;
    }

    .hide-mobile {
        display: none;
    }

    .categories-grid {
        display: grid;
        width: 100%;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
    }

    .category-item {
        justify-content: flex-start;
        width: 100%;
        background: rgb(255 255 255 / 2%);
        border: 0.0625rem solid rgb(255 255 255 / 5%);
        padding: 0.75rem 1rem;

        :deep(.q-checkbox) {
            width: 100%;
        }
    }

    .all-btn {
        width: 100%;
        font-size: 0.8rem;
        background: rgb(255 255 255 / 3%);
        padding: 0.75rem;
        border-radius: 0.5rem;
        margin-bottom: 0.5rem;
    }
}

@media (width <= 25rem) {
    .categories-grid {
        grid-template-columns: 1fr;
    }
}
</style>
