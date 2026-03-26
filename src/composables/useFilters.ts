import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { useStoreGoods } from 'stores/goods.store';
import type { Category } from 'src/types/types';
import { watch, watchEffect } from 'vue';
import type { Ref } from 'vue';

export const useFilters = (
    categories: Ref<Category[]>,
    loadPaginatedGoods: () => Promise<void>,
    route: RouteLocationNormalizedLoaded,
    router: Router,
    currentPage: Ref<number>,
) => {
    const storeGoods = useStoreGoods();

    const updateSelectedCategories = async () => {
        const selected = categories.value.filter((cat) => cat.active).map((cat) => cat.label);

        if (route.name === 'workshop') {
            storeGoods.selectedWorkshopCategories = selected;
        } else if (route.name === 'black-market') {
            storeGoods.selectedBlackMarketCategories = selected;
        }

        if (selected.length === 0) {
            await router.push({ query: { page: 1 } });
        } else {
            await router.push({
                query: {
                    categories: selected.join(','),
                    page: currentPage.value,
                },
            });
        }
        await loadPaginatedGoods();
    };

    const resetCategories = async () => {
        categories.value.forEach((cat) => (cat.active = false));
        await router.replace({ query: { page: 1 } });
        await updateSelectedCategories();
    };

    watch(
        () => route.query.categories,
        async (newCategories) => {
            const categoriesStr = Array.isArray(newCategories) ? newCategories[0] : newCategories;

            if (route.name === 'workshop') {
                storeGoods.selectedWorkshopCategories = categoriesStr
                    ? categoriesStr.split(',')
                    : [];
            }

            if (route.name === 'black-market') {
                storeGoods.selectedBlackMarketCategories = categoriesStr
                    ? categoriesStr.split(',')
                    : [];
            }

            if (!categoriesStr || categoriesStr.length === 0) {
                categories.value.forEach((cat) => (cat.active = false));
            }
            await loadPaginatedGoods();
        },
    );

    watchEffect(() => {
        categories.value.forEach((cat) => {
            if (route.name === 'workshop') {
                cat.active = storeGoods.selectedWorkshopCategories.includes(cat.label);
            } else if (route.name === 'black-market') {
                cat.active = storeGoods.selectedBlackMarketCategories.includes(cat.label);
            }
        });
    });

    return {
        updateSelectedCategories,
        resetCategories,
    };
};
