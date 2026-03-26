import { type Good, useStoreGoods } from 'stores/goods.store';
import { Notify } from 'quasar';
import { computed } from 'vue';

export const useManageStash = () => {
    const storeGoods = useStoreGoods();

    const showToast = (message: string, color: 'positive' | 'negative') => {
        Notify.create({
            timeout: 2000,
            message,
            color,
            textColor: color === 'positive' ? 'dark' : 'primary',
            position: 'bottom-right',
            progress: true,
            progressClass: 'progress',
            actions: [
                {
                    icon: 'close',
                    color: color === 'positive' ? 'dark' : 'primary',
                    dense: true,
                    size: 'xs',
                    handler: () => {},
                },
            ],
        });
    };

    const addToStash = (selected: Good) => {
        const stash = storeGoods.stashGoods;
        const existingGood = stash.find((good: Good) => good.slug === selected.slug);

        if (!existingGood) {
            const newGood: Good = {
                ...selected,
                quantity: 1,
            };
            storeGoods.stashGoods.push(newGood);
            showToast('Item added to stash', 'positive');
        } else {
            const currentQty = existingGood.quantity ?? 0;

            if (currentQty < 5) {
                existingGood.quantity = currentQty + 1;
                showToast('Item added to stash', 'positive');
            } else {
                showToast('Limit per item reached (max 5)', 'negative');
            }
        }
    };

    const removeFromStash = (goodIdx: number) => {
        storeGoods.stashGoods.splice(goodIdx, 1);
    };

    const basePrice = computed(() => {
        const stash = storeGoods.stashGoods;

        return stash.reduce(
            (total: number, currentGood: Good) =>
                total + (currentGood.price || 0) * (currentGood.quantity || 0),
            0,
        );
    });

    const goblinTax = computed(() => Math.floor(basePrice.value * 0.05));
    const finalPrice = computed(() => basePrice.value + goblinTax.value);

    const decreaseGoodQuantity = (good: Good) => {
        const currentQty = good.quantity ?? 0;
        if (currentQty > 1) {
            good.quantity = currentQty - 1;
        }
    };

    const increaseGoodQuantity = (good: Good) => {
        const currentQty = good.quantity ?? 0;
        if (currentQty < 5) {
            good.quantity = currentQty + 1;
        }
    };

    return {
        basePrice,
        goblinTax,
        finalPrice,
        addToStash,
        removeFromStash,
        decreaseGoodQuantity,
        increaseGoodQuantity,
    };
};
