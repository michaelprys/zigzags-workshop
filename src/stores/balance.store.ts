import { acceptHMRUpdate, defineStore } from 'pinia';
import supabaseApi from 'src/api/supabase.api';
import { reactive, ref } from 'vue';

export type PaymentType = 'gold' | 'emberheart_rubies' | 'gamblers_lootbox';

interface UserBalance {
    user_id: string;
    gold: number;
    emberheart_rubies: number;
    gamblers_lootbox: number;
}

export const useStoreBalance = defineStore(
    'balance',
    () => {
        const pending = ref(false);
        const sessionId = ref<string | null>(null);
        const purchaseStatus = ref('');
        const balance = reactive<Record<PaymentType, number | null>>({
            gold: null,
            emberheart_rubies: null,
            gamblers_lootbox: null,
        });

        const displayBalance = async () => {
            pending.value = true;
            try {
                const { data: authData } = await supabaseApi.auth.getUser();
                const user = authData.user;

                if (!user) return;

                const { data, error } = await supabaseApi
                    .from('user_balances')
                    .select('*')
                    .eq('user_id', user.id)
                    .returns<UserBalance[]>()
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    balance.gold = data.gold;
                    balance.emberheart_rubies = data.emberheart_rubies;
                    balance.gamblers_lootbox = data.gamblers_lootbox;
                } else {
                    balance.gold = 0;
                    balance.emberheart_rubies = 0;
                    balance.gamblers_lootbox = 0;
                }
            } catch (err) {
                console.error(err);
            } finally {
                pending.value = false;
            }
        };

        const topUpBalance = async (
            urlSessionId: string,
            transactionStatus: string,
            amount: number,
            paymentType: PaymentType,
        ) => {
            if (sessionId.value === urlSessionId) return;
            pending.value = true;
            try {
                const { data: authData } = await supabaseApi.auth.getUser();
                const user = authData.user;

                if (!user) return;

                const { error: txErr } = await supabaseApi.from('transactions').upsert(
                    {
                        user_id: user.id,
                        session_id: urlSessionId,
                        status: transactionStatus,
                        amount,
                        payment_type: paymentType,
                    },
                    { onConflict: 'session_id' },
                );

                if (txErr && txErr.code !== '23505') throw txErr;

                if (transactionStatus === 'success') {
                    const { error: rpcErr } = await supabaseApi.rpc('increment_balance', {
                        user_id: user.id,
                        amount: amount,
                        payment_type: paymentType,
                    });

                    if (rpcErr) throw rpcErr;
                }
                sessionId.value = urlSessionId;
                await displayBalance();
            } catch (err) {
                console.error(err);
            } finally {
                pending.value = false;
            }
        };

        const updateBalance = async (paymentType: PaymentType, cost: number) => {
            pending.value = true;
            try {
                const { data: authData } = await supabaseApi.auth.getUser();
                const user = authData.user;

                if (!user) return;

                const { data: dbData, error: fetchError } = await supabaseApi
                    .from('user_balances')
                    .select('*')
                    .eq('user_id', user.id)
                    .returns<UserBalance>()
                    .single();

                if (fetchError || !dbData) throw new Error('Balance not found');

                const newBalance = (dbData[paymentType] || 0) - cost;
                const { error: updateError } = await supabaseApi
                    .from('user_balances')
                    .update({ [paymentType]: newBalance })
                    .eq('user_id', user.id);

                if (updateError) throw updateError;
                balance[paymentType] = newBalance;
                purchaseStatus.value = 'purchased';
            } catch (err) {
                console.error(err);
            } finally {
                pending.value = false;
            }
        };

        return {
            pending,
            balance,
            sessionId,
            purchaseStatus,
            topUpBalance,
            displayBalance,
            updateBalance,
        };
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['sessionId', 'balance'],
        },
    },
);

interface ImportMetaHot {
    accept: (cb: unknown) => void;
}

const hot = (import.meta as unknown as { hot?: ImportMetaHot }).hot;
if (hot) {
    hot.accept(acceptHMRUpdate(useStoreBalance, hot));
}
