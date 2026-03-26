import supabaseApi from 'src/api/supabase.api';
import type { QForm } from 'quasar';
import type { Ref } from 'vue';
import { ref } from 'vue';

interface PaymentTypeOption {
    value: string;
    label: string;
    price: string | number;
}

interface CheckoutResponse {
    url?: string;
    sessionID?: string;
}

export const useTopUpPayment = (
    paymentType: Ref<PaymentTypeOption | undefined>,
    topUpAmount: Ref<number>,
    minAmounts: Record<string, number>,
) => {
    const pending = ref(false);
    const handlePayment = async (topUpForm: QForm) => {
        pending.value = true;
        try {
            const valid = await topUpForm.validate();

            if (!valid) return;
            const selectedType = paymentType.value?.value;

            if (!selectedType) return;
            const minAmount = minAmounts[selectedType] ?? 0;

            if (topUpAmount.value < minAmount) return;
            const price = paymentType.value?.price;

            if (!price) return;
            const {
                data: { session },
                error: sessionError,
            } = await supabaseApi.auth.getSession();

            if (sessionError || !session) return;
            const { data, error: functionError } =
                await supabaseApi.functions.invoke<CheckoutResponse>('create-checkout-session', {
                    body: {
                        sessionData: {
                            price: price,
                            quantity: topUpAmount.value,
                            paymentType: selectedType,
                        },
                    },
                });

            if (functionError) throw functionError;

            if (data?.url) {
                window.location.href = data.url;
            } else if (data?.sessionID) {
                console.warn(
                    'Backend returned sessionID instead of URL. Update Edge Function to return session.url',
                );
            }
        } catch (err) {
            console.error('Payment error:', err);
        } finally {
            pending.value = false;
        }
    };

    return {
        pending,
        handlePayment,
    };
};
