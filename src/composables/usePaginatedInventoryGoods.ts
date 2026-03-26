import { useStoreInventory } from 'stores/inventory.store';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export const usePaginatedInventoryGoods = () => {
    const storeInventory = useStoreInventory();
    const route = useRoute();
    const router = useRouter();
    const pageStr = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page;
    const currentPage = ref(parseInt(pageStr ?? '') || 1);
    const inventoryGoodsPerPage = 55;
    const loadPaginatedInventoryGoods = async () => {
        await nextTick();

        if (currentPage.value > storeInventory.totalInventoryPages) {
            await router.replace({ query: { ...route.query, page: 1 } });
        }
        await storeInventory.loadInventoryGoods(currentPage.value, inventoryGoodsPerPage);
    };

    watch(
        () => route.query.page,
        async (newPage) => {
            const pageStr = Array.isArray(newPage) ? newPage[0] : newPage;
            const page = parseInt(pageStr ?? '') || 1;

            if (page !== currentPage.value) {
                currentPage.value = page;
                await loadPaginatedInventoryGoods();
            }
        },
    );
    watch(currentPage, async (newPage) => {
        const pageParam = route.query.page;
        const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam;

        if (pageStr == null || typeof pageStr !== 'string') return;

        if (newPage !== parseInt(pageStr)) {
            await router.push({ query: { ...route.query, page: newPage.toString() } });
        }
    });
    onMounted(async () => {
        await storeInventory.loadInventoryGoods(currentPage.value, inventoryGoodsPerPage);
    });

    return {
        currentPage,
        inventoryGoodsPerPage,
        loadPaginatedInventoryGoods,
    };
};
