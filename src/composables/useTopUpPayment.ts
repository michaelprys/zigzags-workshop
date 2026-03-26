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

            const currentOption = paymentType.value;
            const selectedType = currentOption?.value;
            const price = currentOption?.price;

            console.log('[Payment] Attempting with:', { selectedType, price });

            const numericPrice = Number(price);

            if (!selectedType || isNaN(numericPrice)) {
                console.error('[Payment] Final check failed: Price is NaN or Type missing');

                return;
            }

            const minAmount = minAmounts[selectedType] ?? 0;
            if (topUpAmount.value < minAmount) return;

            const sessionRes = await supabaseApi.auth.getSession();
            if (sessionRes.error || !sessionRes.data.session) return;

            const response = await supabaseApi.functions.invoke<CheckoutResponse>(
                'create-checkout-session',
                {
                    body: {
                        sessionData: {
                            price: numericPrice,
                            quantity: topUpAmount.value,
                            paymentType: selectedType,
                        },
                    },
                },
            );

            if (response.error) throw response.error;

            if (response.data?.url) {
                window.location.href = response.data.url;
            }
        } catch (err) {
            console.error('[Payment] Error:', err);
        } finally {
            pending.value = false;
        }
    };

    return {
        pending,
        handlePayment,
    };
};
