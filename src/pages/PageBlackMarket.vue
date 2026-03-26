<script setup lang="ts">
import { usePaginatedGoods } from 'src/composables/usePaginatedGoods';
import ItemCategories from 'src/components/items/ItemCategories.vue';
import { useManageStash } from 'src/composables/useManageStash';
import { useTransition } from 'src/composables/useTransition';
import IconDebuff from 'src/components/icons/IconDebuff.vue';
import { useFilters } from 'src/composables/useFilters';
import { ref, watch, onMounted, computed } from 'vue';
import { delayUtils } from 'src/utils/delay.utils';
import { useStoreGoods } from 'stores/goods.store';
import { useRoute, useRouter } from 'vue-router';
import type { Category } from 'src/types/types';

const { applyTransition } = useTransition();
const storeGoods = useStoreGoods();
const route = useRoute();
const router = useRouter();
const { addToStash } = useManageStash();
const syncCategoriesFromUrl = (targetArray: Category[]) => {
    const queryCats = route.query.category;
    const activeCats = Array.isArray(queryCats) ? queryCats : queryCats ? [queryCats] : [];

    targetArray.forEach((cat) => {
        cat.active = activeCats.includes(cat.label);
    });
};
const categories = ref<Category[]>([
    { label: 'consumables', active: false },
    { label: 'trinkets', active: false },
    { label: 'weapons', active: false },
    { label: 'companions', active: false },
    { label: 'mounts', active: false },
]);

syncCategoriesFromUrl(categories.value);
const { currentPage, queryData, isPending, loadPaginatedGoods } = usePaginatedGoods(true);
const { updateSelectedCategories, resetCategories } = useFilters(
    categories,
    loadPaginatedGoods,
    route,
    router,
    currentPage,
);
const hasInitialLoaded = ref(false);
const showEmptyState = computed(
    () => !isPending.value && hasInitialLoaded.value && queryData.value?.length === 0,
);
const imgLoaded = ref<Record<string, boolean>>({});

watch(
    () => queryData.value,
    (newGoods) => {
        if (!newGoods) return;
        newGoods.forEach((good) => {
            const img = new Image();

            img.onload = async () => {
                if (img.complete) {
                    imgLoaded.value[good?.id] = true;
                } else {
                    await delayUtils(200);
                    imgLoaded.value[good?.id] = true;
                }
            };
            img.src = good?.image_url;
        });
    },
    { immediate: true, deep: true },
);
watch(
    () => route.query.category,
    () => {
        syncCategoriesFromUrl(categories.value);
        loadPaginatedGoods();
    },
);
onMounted(async () => {
    await loadPaginatedGoods();
    hasInitialLoaded.value = true;
});
</script>

<template>
    <q-page>
        <div class="overlay"></div>
        <section id="black-market">
            <h1 class="text-center text-h3 title q-mt-md q-mb-lg">Hunt treasures</h1>
            <ItemCategories
                :categories="categories"
                :update-selected-categories="updateSelectedCategories"
                :reset-categories="resetCategories" />
            <div class="column flex-center q-px-md relative-position col-grow">
                <template v-if="isPending || (queryData && queryData.length > 0)">
                    <ul class="flex flex-center q-gutter-lg q-mt-lg q-pl-none goods-list">
                        <template v-if="isPending">
                            <li v-for="n in 8" :key="n" class="card">
                                <q-card flat class="fit column no-wrap bg-transparent">
                                    <div class="image-wrapper">
                                        <q-skeleton
                                            square
                                            class="skeleton-custom"
                                            height="13.125rem" />
                                    </div>
                                    <q-card-section>
                                        <q-skeleton class="skeleton-custom q-mb-sm" height="2rem" />
                                    </q-card-section>
                                    <q-card-section class="q-pt-none">
                                        <q-skeleton class="skeleton-custom" height="4rem" />
                                    </q-card-section>
                                    <q-card-actions
                                        class="flex justify-between q-mt-auto q-px-md q-pb-md">
                                        <q-skeleton
                                            type="QBtn"
                                            width="5rem"
                                            class="skeleton-custom" />
                                        <q-skeleton
                                            type="QBtn"
                                            width="5rem"
                                            class="skeleton-custom" />
                                    </q-card-actions>
                                </q-card>
                            </li>
                        </template>
                        <template v-else>
                            <li
                                v-for="good in queryData"
                                :key="good.id"
                                class="card"
                                @click="storeGoods.selectGood(good)">
                                <q-card flat class="fit column no-wrap bg-transparent">
                                    <div class="image-wrapper relative-position">
                                        <Transition name="fade">
                                            <q-skeleton
                                                v-if="!imgLoaded[good.id]"
                                                square
                                                class="skeleton-img skeleton-custom" />
                                        </Transition>
                                        <q-img class="image" :src="good.image_url" />
                                    </div>
                                    <q-card-section>
                                        <div
                                            class="relative-position items-center no-wrap row height-title">
                                            <Transition name="fade">
                                                <q-skeleton
                                                    v-if="!imgLoaded[good.id]"
                                                    class="skeleton-name skeleton-custom" />
                                            </Transition>
                                            <div class="col ellipsis text-h6 text-primary">
                                                {{ good.name }}
                                            </div>
                                        </div>
                                    </q-card-section>
                                    <q-card-section class="q-pt-none">
                                        <div
                                            class="flex items-center no-wrap row relative-position height-content">
                                            <Transition name="fade">
                                                <q-skeleton
                                                    v-if="!imgLoaded[good.id]"
                                                    class="skeleton-content skeleton-custom" />
                                            </Transition>
                                            <div class="column">
                                                <div
                                                    class="flex items-center"
                                                    style="gap: 0.3125rem">
                                                    <span class="text-secondary text-subtitle1">
                                                        Price: {{ good.price }} gold
                                                    </span>
                                                    <div
                                                        v-if="good.debuff"
                                                        class="flex items-center text-negative">
                                                        <IconDebuff>
                                                            <q-tooltip class="bg-primary text-dark">
                                                                <span
                                                                    class="text-caption"
                                                                    style="color: #ff7f50">
                                                                    Debuff
                                                                </span>
                                                            </q-tooltip>
                                                        </IconDebuff>
                                                    </div>
                                                </div>
                                                <span
                                                    class="inline-block text-caption text-grey description-text">
                                                    {{ good.short_description }}
                                                </span>
                                            </div>
                                        </div>
                                    </q-card-section>
                                    <q-card-actions
                                        class="flex justify-between q-mt-auto q-px-md q-pb-md">
                                        <q-btn flat color="primary" @click.stop="addToStash(good)">
                                            💰 Add
                                        </q-btn>
                                        <RouterLink
                                            :to="{
                                                name: 'good-details',
                                                params: {
                                                    category: good?.category,
                                                    slug: good?.slug,
                                                },
                                            }"
                                            class="no-decoration">
                                            <q-btn flat color="primary">Details</q-btn>
                                        </RouterLink>
                                    </q-card-actions>
                                </q-card>
                            </li>
                        </template>
                    </ul>
                    <div
                        v-if="!isPending && storeGoods.totalPages > 0"
                        class="pagination-wrapper q-py-xl">
                        <div
                            class="custom-pagination flex items-center no-wrap shadow-24 black-market-pagination"
                            @click="applyTransition('pagination', 150)">
                            <q-btn
                                icon="chevron_left"
                                flat
                                round
                                dense
                                :disable="currentPage <= 1"
                                class="nav-arrow"
                                @click="
                                    currentPage--;
                                    loadPaginatedGoods();
                                " />
                            <q-pagination
                                v-model="currentPage"
                                color="primary"
                                active-color="secondary"
                                active-text-color="dark"
                                size="md"
                                :max="storeGoods.totalPages"
                                flat
                                @update:model-value="loadPaginatedGoods" />
                            <q-btn
                                icon="chevron_right"
                                flat
                                round
                                dense
                                :disable="currentPage >= storeGoods.totalPages"
                                class="nav-arrow"
                                @click="
                                    currentPage++;
                                    loadPaginatedGoods();
                                " />
                        </div>
                    </div>
                </template>
                <div
                    v-else-if="showEmptyState"
                    class="empty-state-wrapper column flex-center q-pa-md">
                    <div class="container column flex-center">
                        <div class="content-wrapper column flex-center q-mt-xl text-center">
                            <h2
                                class="text-h4 text-secondary text-weight-bold uppercase letter-spacing-2 q-ma-none">
                                Empty Crates!
                            </h2>
                            <p class="text q-mt-md text-primary text-subtitle1">
                                Try selecting another one.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </q-page>
</template>

<style lang="scss" scoped>
@use 'sass:map';

#black-market {
    padding-top: 4.625em;
    padding-bottom: 8.5em;
    min-height: calc(100vh - 12.5rem);
}

.goods-list {
    max-width: 84.5rem;
    width: 100%;
    list-style: none;
}

.height-title {
    height: 2rem;
}

.height-content {
    height: 4rem;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
}

.custom-pagination {
    gap: 0.5rem;
    backdrop-filter: blur(0.9375rem);
    background: rgb(0 0 0 / 40%);
    border: 0.0625rem solid rgb(255 255 255 / 5%);
    padding: 0.375rem 0.75rem;
    border-radius: 3.125rem;

    &.black-market-pagination {
        border-color: rgb(113 11 3 / 30%);
    }
}

.nav-arrow {
    color: $primary;
    transition: all 0.3s ease;

    &:hover:not(.disabled) {
        background: rgb(255 255 255 / 5%);
        color: $secondary;
    }
}

:deep(.q-pagination .q-btn) {
    margin: 0 0.125rem;
    font-weight: 800;
    border-radius: 50% !important;
}

.empty-state-wrapper {
    flex-grow: 1;
}

.letter-spacing-2 {
    letter-spacing: 0.125rem;
}

.skeleton-custom {
    position: relative;
    background: rgb(255 255 255 / 3%);
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgb(255 255 255 / 4%) 40%,
            rgb(255 255 255 / 4%) 60%,
            transparent 100%
        );
        animation: shimmer 2.5s infinite ease-in-out;
    }
}

@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}

.skeleton-img {
    position: absolute;
    inset: 0;
    z-index: 1;
    height: 13.125rem;
}

.skeleton-name {
    position: absolute;
    inset: 0;
    z-index: 1;
    height: 2rem;
}

.skeleton-content {
    position: absolute;
    inset: 0;
    z-index: 1;
    height: 4rem;
}

.description-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 3rem;
}

.no-decoration {
    text-decoration: none;
}

.card {
    display: flex;
    flex-direction: column;
    min-height: 26.875rem;
    width: 19.625rem;
    background: linear-gradient(45deg, rgb(0 0 0 / 90%) 0%, rgb(50 0 0 / 100%) 100%);
    cursor: pointer;
    transition: transform 0.2s ease;
    padding: 0.9375rem;
    border: 0.0625rem solid rgb(255 255 255 / 5%);
    border-radius: $rounded;

    &:hover {
        transform: translateY(-0.3125rem);

        .image {
            transform: scale(1.05);
        }
    }

    .image-wrapper {
        height: 13.125rem;
        border-top-left-radius: $rounded;
        border-top-right-radius: $rounded;
        overflow: hidden;
    }

    .image {
        height: 100%;
        transition: transform 0.2s linear;
    }
}

.title {
    font-size: map.get($h3, 'size');
    color: #710b03;
}

.overlay {
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.5;
}

.overlay::before {
    position: absolute;
    transform: translateX(-50%);
    z-index: -1;
    min-height: 100vh;
    width: 100%;
    background: radial-gradient(ellipse at center, rgb(10 10 60 / 60%) 0%, transparent 80%);
    content: '';
    top: 0;
    left: 50%;
}
</style>
