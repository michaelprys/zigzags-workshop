import { computed, ref } from 'vue';

type PaymentType = {
    value: string;
    label: string;
    price: number;
};

export const useTopUpState = () => {
    const env = import.meta.env as unknown as Record<string, string | undefined>;

    const paymentTypes: PaymentType[] = [
        {
            value: 'gold',
            label: 'Gold',
            price: Number(env.VITE_PRICE_GOLD ?? 0),
        },
        {
            value: 'emberheart_rubies',
            label: 'Emberheart Rubies',
            price: Number(env.VITE_PRICE_EMBERHEART_RUBIES ?? 0),
        },
        {
            value: 'gamblers_lootbox',
            label: "Gambler's Lootbox",
            price: Number(env.VITE_PRICE_GAMBLERS_LOOTBOX ?? 0),
        },
    ];

    const paymentType = ref<PaymentType | undefined>(paymentTypes[0]);
    const topUpAmount = ref(100);

    const minAmounts: Record<string, number> = {
        gold: 100,
        emberheart_rubies: 10,
        gamblers_lootbox: 1,
    };

    const decrement = () => {
        const key = paymentType.value?.value ?? 'gold';
        const min = minAmounts[key] ?? 100;

        topUpAmount.value = Math.max(topUpAmount.value - min, min);
    };

    const increment = () => {
        const key = paymentType.value?.value ?? 'gold';
        const min = minAmounts[key] ?? 100;

        topUpAmount.value += min;
    };

    const resetAmount = () => {
        const key = paymentType.value?.value ?? 'gold';
        const min = minAmounts[key] ?? 100;

        topUpAmount.value = min;
    };

    const calculatedAmount = computed(() => {
        let goldEquivalent = topUpAmount.value;

        if (paymentType.value?.value === 'emberheart_rubies') {
            goldEquivalent = topUpAmount.value * 100;
        } else if (paymentType.value?.value === 'gamblers_lootbox') {
            goldEquivalent = topUpAmount.value * 1000;
        }
        const goldToUsd = 0.01;

        return (goldEquivalent * goldToUsd).toFixed(2);
    });

    return {
        paymentTypes,
        paymentType,
        topUpAmount,
        minAmounts,
        resetAmount,
        increment,
        decrement,
        calculatedAmount,
    };
};
