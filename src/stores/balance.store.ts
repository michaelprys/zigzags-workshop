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

interface ImportMetaHot {
    accept: (cb: unknown) => void;
}

interface ImportMetaWithHot extends ImportMeta {
    hot?: ImportMetaHot;
}

export const useStoreBalance = defineStore(
    'balance',
    () => {
        const pending = ref(false);
        const sessionId = ref<string | null>(null);
        const purchaseStatus = ref('');
        const balance = reactive<Record<PaymentType, number>>({
            gold: 0,
            emberheart_rubies: 0,
            gamblers_lootbox: 0,
        });

        const displayBalance = async () => {
            try {
                const { data: authData } = await supabaseApi.auth.getUser();
                const user = authData.user;

                if (!user) {
                    balance.gold = 0;
                    balance.emberheart_rubies = 0;
                    balance.gamblers_lootbox = 0;

                    return;
                }

                pending.value = true;

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
                    const { data: newBalance, error: insertError } = await supabaseApi
                        .from('user_balances')
                        .insert({
                            user_id: user.id,
                            gold: 0,
                            emberheart_rubies: 0,
                            gamblers_lootbox: 0,
                        })
                        .select()
                        .single<UserBalance>();

                    if (insertError) throw insertError;

                    if (newBalance) {
                        balance.gold = newBalance.gold;
                        balance.emberheart_rubies = newBalance.emberheart_rubies;
                        balance.gamblers_lootbox = newBalance.gamblers_lootbox;
                    }
                }
            } catch (err: unknown) {
                console.error('[Store: Balance] Error:', err);
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
            } catch (err: unknown) {
                console.error('[Store: Balance] TopUp Error:', err);
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

                const newBalance = (dbData[paymentType] ?? 0) - cost;

                const { error: updateError } = await supabaseApi
                    .from('user_balances')
                    .update({ [paymentType]: newBalance })
                    .eq('user_id', user.id);

                if (updateError) throw updateError;

                balance[paymentType] = newBalance;
                purchaseStatus.value = 'purchased';
            } catch (err: unknown) {
                console.error('[Store: Balance] Update Error:', err);
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

const hot = (import.meta as ImportMetaWithHot).hot;

if (hot) {
    hot.accept(acceptHMRUpdate(useStoreBalance, hot));
}
