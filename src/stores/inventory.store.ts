import { useStoreBalance } from 'stores/balance.store';
import { useStoreGoods } from 'stores/goods.store';
import supabaseApi from 'src/api/supabase.api';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface InventoryItem {
    good_id: number;
    user_id: string;
    quantity: number;
    slot: number;
    goods: {
        id: number;
        name: string;
        image_url: string;
        price: number;
        short_description: string;
        category: string;
    };
}

export interface Invitation {
    good_id: number;
    goods: {
        slug: string;
    };
}

interface StashGood {
    id: number;
    quantity?: number;
}

export const useStoreInventory = defineStore('inventory', () => {
    const pending = ref(false);
    const totalInventoryGoods = ref(0);
    const inventoryGoods = ref<InventoryItem[]>([]);
    const invitation = ref<Invitation | null>(null);
    const totalInventoryPages = computed(() => Math.ceil(totalInventoryGoods.value / 55));

    const saveGoodsToInventory = async () => {
        pending.value = true;
        try {
            const storeGoods = useStoreGoods();
            const storeBalance = useStoreBalance();
            const {
                data: { user },
            } = await supabaseApi.auth.getUser();

            if (!user || storeBalance.purchaseStatus !== 'purchased') return;

            const goodsToInsert = (storeGoods.stashGoods as StashGood[]).map((good) => ({
                good_id: good.id,
                user_id: user.id,
                quantity: good.quantity ?? 1,
                status: 'purchased',
            }));

            const { error } = await supabaseApi.rpc('update_goods', {
                goods: goodsToInsert,
            });

            if (error) throw error;
            await loadInventoryGoods(1, 55);
        } catch (err) {
            console.error(err);
        } finally {
            pending.value = false;
        }
    };

    const loadInventoryGoods = async (currentPage: number, inventoryGoodsPerPage: number) => {
        pending.value = true;
        try {
            const {
                data: { user },
            } = await supabaseApi.auth.getUser();
            if (!user) return;

            const start = (currentPage - 1) * inventoryGoodsPerPage;
            const end = start + inventoryGoodsPerPage - 1;

            const { data, count, error } = await supabaseApi
                .from('user_goods')
                .select(
                    `
                    good_id, user_id, quantity, slot,
                    goods (id, name, image_url, price, short_description, category)
                `,
                    { count: 'exact' },
                )
                .eq('user_id', user.id)
                .range(start, end)
                .order('slot', { ascending: true });

            if (error) throw error;
            totalInventoryGoods.value = count || 0;
            inventoryGoods.value = (data as unknown as InventoryItem[]) || [];
        } catch (err) {
            console.error(err);
        } finally {
            pending.value = false;
        }
    };

    const removeGoodFromInventory = async (goodId: number) => {
        pending.value = true;
        try {
            const {
                data: { user },
            } = await supabaseApi.auth.getUser();
            if (!user) return;

            const { error } = await supabaseApi
                .from('user_goods')
                .delete()
                .eq('user_id', user.id)
                .eq('good_id', goodId);

            if (error) throw error;
            await checkInvitation();
            await loadInventoryGoods(1, 55);
        } catch (err) {
            console.error(err);
        } finally {
            pending.value = false;
        }
    };

    const updateGoodSlot = async (goodId: number, nextSlot: number) => {
        try {
            const {
                data: { user },
            } = await supabaseApi.auth.getUser();
            if (!user) return;

            await supabaseApi
                .from('user_goods')
                .update({ slot: nextSlot })
                .eq('user_id', user.id)
                .eq('good_id', goodId);
        } catch (err) {
            console.error(err);
        }
    };

    const checkInvitation = async () => {
        const {
            data: { user },
        } = await supabaseApi.auth.getUser();
        if (!user) return;

        const { data } = await supabaseApi
            .from('user_goods')
            .select('good_id, goods!inner(slug)')
            .eq('user_id', user.id)
            .eq('goods.slug', 'invitation')
            .maybeSingle();

        invitation.value = (data as unknown as Invitation) || null;
    };

    return {
        pending,
        inventoryGoods,
        totalInventoryGoods,
        totalInventoryPages,
        saveGoodsToInventory,
        loadInventoryGoods,
        removeGoodFromInventory,
        updateGoodSlot,
        checkInvitation,
        invitation,
    };
});
