import { default as supabase } from 'src/api/supabase.api';
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreBalance } from 'stores/balance.store';
import { useRouter } from 'vue-router';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface Good {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
    requires_access: boolean;
    category: string | null;
    description: string | null;
    short_description: string | null;
    price: number;
    debuff: string | null;
    source: string | null;
    quantity?: number;
}

export interface UserGood {
    user_id: string;
    good_id: number;
    quantity: number;
    status: 'purchased' | 'active' | 'consumed';
    slot: number;
}

export const useStoreGoods = defineStore(
    'goods',
    () => {
        const pending = ref(false);
        const stashGoods = ref<Good[]>([]);
        const totalGoods = ref(0);
        const selectedGood = ref<Good | null>(null);
        const selectedWorkshopCategories = ref<string[]>([]);
        const selectedBlackMarketCategories = ref<string[]>([]);
        const totalPages = computed(() => Math.ceil(totalGoods.value / 8));
        const router = useRouter();

        const loadGoods = async (
            currentPage: number,
            goodsPerPage: number,
            requiresAccess: boolean,
        ): Promise<Good[]> => {
            pending.value = true;
            try {
                let query = supabase
                    .from('goods')
                    .select('*', { count: 'exact' })
                    .eq('requires_access', requiresAccess);

                const cats = requiresAccess
                    ? selectedBlackMarketCategories.value
                    : selectedWorkshopCategories.value;

                if (cats?.length) {
                    query = query.in('category', cats);
                }

                const start = (currentPage - 1) * goodsPerPage;
                const end = start + goodsPerPage - 1;

                const { data, count, error } = await query.range(start, end).order('id');

                if (error) throw error;
                totalGoods.value = count || 0;

                return (data as Good[]) || [];
            } catch (err) {
                console.error('Failed to load goods:', err);

                return [];
            } finally {
                pending.value = false;
            }
        };

        const loadFeaturedGoods = async (): Promise<Partial<Good>[]> => {
            try {
                const { data, error } = await supabase
                    .from('goods')
                    .select('id, name, image_url')
                    .limit(12);

                if (error) throw error;

                return (data as Partial<Good>[]) || [];
            } catch (err) {
                console.error('Failed to load featured goods:', err);

                return [];
            }
        };

        const loadSuggestedGoods = async (): Promise<Good[]> => {
            try {
                const { data, error } = await supabase.from('goods').select('*');
                if (error) throw error;

                return (data as Good[]) || [];
            } catch (err) {
                console.error('Failed to load suggested goods:', err);

                return [];
            }
        };

        const purchaseInvitation = async (): Promise<boolean> => {
            pending.value = true;
            try {
                const storeBalance = useStoreBalance();
                const storeInventory = useStoreInventory();
                const authRes = await supabase.auth.getUser();
                const user = authRes.data.user;

                if (!user) return false;

                const userId = user.id;
                const { data: invGood, error: fetchErr } = await supabase
                    .from('goods')
                    .select('*')
                    .eq('slug', 'invitation')
                    .maybeSingle<Good>();

                if (fetchErr || !invGood) return false;

                const price = 20000;
                await storeBalance.updateBalance('gold', price);

                const countRes = await supabase
                    .from('user_goods')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId);

                const payload: UserGood = {
                    user_id: userId,
                    good_id: invGood.id,
                    quantity: 1,
                    status: 'purchased',
                    slot: (countRes.count || 0) + 1,
                };

                const { error: insErr } = await supabase.from('user_goods').insert(payload);
                if (insErr) throw insErr;

                await storeInventory.checkInvitation();
                await storeInventory.loadInventoryGoods(1, 55);
                void router.push({ name: 'black-market' });

                return true;
            } catch (err) {
                console.error('Purchase error:', err);

                return false;
            } finally {
                pending.value = false;
            }
        };

        return {
            pending,
            stashGoods,
            totalGoods,
            selectedGood,
            selectedWorkshopCategories,
            selectedBlackMarketCategories,
            totalPages,
            loadGoods,
            loadFeaturedGoods,
            loadSuggestedGoods,
            purchaseInvitation,
            selectGood: (good: Good | null) => {
                selectedGood.value = good;
            },
        };
    },
    { persist: { storage: sessionStorage, pick: ['selectedGood', 'stashGoods'] } },
);
