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

    const handlePayment = async (topUpForm: QForm | null) => {
        if (!topUpForm) return;

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

            const sessionRes = await supabaseApi.auth.getSession();

            if (sessionRes.error || !sessionRes.data.session) {
                return;
            }

            const response = await supabaseApi.functions.invoke<CheckoutResponse>(
                'create-checkout-session',
                {
                    body: {
                        sessionData: {
                            price: price,
                            quantity: topUpAmount.value,
                            paymentType: selectedType,
                        },
                    },
                },
            );

            if (response.error !== null) {
                throw response.error as Error;
            }

            const responseData = response.data;

            if (responseData?.url) {
                window.location.href = responseData.url;
            } else if (responseData?.sessionID) {
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
