import { default as supabase } from 'src/api/supabase.api';
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreBalance } from 'stores/balance.store';
import { useRouter } from 'vue-router';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface Good {
    category: string | null;
    debuff: string | null;
    description: string | null;
    id: number;
    image_url: string | null;
    name: string;
    price: number;
    quantity?: number;
    requires_access: boolean;
    short_description: string | null;
    slug: string;
    source: string | null;
}

export interface Suggestion {
    label: string;
    value: string;
}

export interface UserGood {
    good_id: number;
    quantity: number;
    slot: number;
    status: 'purchased' | 'active' | 'consumed';
    user_id: string;
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
            const storeInventory = useStoreInventory();

            if (requiresAccess && !storeInventory.invitation) {
                totalGoods.value = 0;

                return [];
            }

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
                console.error(err);

                return [];
            } finally {
                pending.value = false;
            }
        };

        const loadGoodBySlug = async (slug: string): Promise<Good | null> => {
            const storeInventory = useStoreInventory();
            pending.value = true;
            try {
                const { data, error } = await supabase
                    .from('goods')
                    .select('*')
                    .eq('slug', slug)
                    .maybeSingle<Good>();

                if (error || !data) return null;

                if (data.requires_access && !storeInventory.invitation) {
                    return null;
                }

                return data;
            } catch (err) {
                console.error(err);

                return null;
            } finally {
                pending.value = false;
            }
        };

        const loadFeaturedGoods = async (): Promise<Partial<Good>[]> => {
            const storeInventory = useStoreInventory();
            try {
                let query = supabase
                    .from('goods')
                    .select('id, name, image_url, requires_access')
                    .limit(12);

                if (!storeInventory.invitation) {
                    query = query.eq('requires_access', false);
                }

                const { data, error } = await query;
                if (error) throw error;

                return (data as Partial<Good>[]) || [];
            } catch (err) {
                console.error(err);

                return [];
            }
        };

        const loadSuggestedGoods = async (val: string): Promise<Suggestion[]> => {
            const search = val?.trim();
            if (!search || search.length < 2) return [];

            const storeInventory = useStoreInventory();

            try {
                let query = supabase
                    .from('goods')
                    .select('name, slug, requires_access')
                    .ilike('name', `%${search}%`)
                    .limit(10);

                if (!storeInventory.invitation) {
                    query = query.eq('requires_access', false);
                }

                const { data, error } = await query;
                if (error) throw error;

                return (data || []).map((item) => ({
                    label: item.name as string,
                    value: item.slug as string,
                }));
            } catch (err) {
                console.error(err);

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
                    good_id: invGood.id,
                    quantity: 1,
                    slot: (countRes.count || 0) + 1,
                    status: 'purchased',
                    user_id: userId,
                };

                const { error: insErr } = await supabase.from('user_goods').insert(payload);
                if (insErr) throw insErr;

                await storeInventory.checkInvitation();
                await storeInventory.loadInventoryGoods(1, 55);
                void router.push({ name: 'black-market' });

                return true;
            } catch (err) {
                console.error(err);

                return false;
            } finally {
                pending.value = false;
            }
        };

        return {
            loadFeaturedGoods,
            loadGoods,
            loadGoodBySlug,
            loadSuggestedGoods,
            pending,
            purchaseInvitation,
            selectedBlackMarketCategories,
            selectedGood,
            selectedWorkshopCategories,
            selectGood: (good: Good | null) => {
                selectedGood.value = good;
            },
            stashGoods,
            totalGoods,
            totalPages,
        };
    },
    { persist: { pick: ['selectedGood', 'stashGoods'], storage: sessionStorage } },
);
