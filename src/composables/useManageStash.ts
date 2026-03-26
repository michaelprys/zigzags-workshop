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
                },
            ],
        });
    };
    const addToStash = async (selected: Good) => {
        let existingGood = storeGoods.stashGoods.find((good) => good.slug === selected.slug);

        if (!existingGood) {
            existingGood = {
                id: selected.id,
                quantity: 1,
                name: selected.name,
                slug: selected.slug,
                category: selected.category,
                image_url: selected.image_url,
                price: selected.price,
                short_description: selected.short_description,
                description: selected.description,
                source: selected.source,
                requires_access: selected.requires_access,
                debuff: selected.debuff ?? '',
            };
            storeGoods.stashGoods.push(existingGood);
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
        return storeGoods.stashGoods.reduce(
            (total, currentGood) => total + currentGood.price * (currentGood.quantity ?? 0),
            0,
        );
    });
    const goblinTax = computed(() => {
        return Math.floor(basePrice.value * 0.05);
    });
    const finalPrice = computed(() => {
        return basePrice.value + goblinTax.value;
    });
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
