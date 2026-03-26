<script setup lang="ts">
import BaseBlackMarket from 'src/components/base/BaseBlackMarket.vue';
import BaseFeatured from 'src/components/base/BaseFeatured.vue';
import { default as supabase } from 'src/api/supabase.api';
import BaseIntro from 'src/components/base/BaseIntro.vue';
import { useStoreGoods } from 'stores/goods.store';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

interface Suggestion {
    label: string;
    value: string;
}

const router = useRouter();
const storeGoods = useStoreGoods();
const model = ref<string | null>(null);
const suggestions = ref<Suggestion[]>([]);

const filterFn = (
    val: string,
    doneFn: (callbackFn: () => void) => void,
    abortFn: () => void,
): void => {
    if (val.length < 2) {
        abortFn();

        return;
    }

    void storeGoods.loadSuggestedGoods(val).then((data) => {
        doneFn(() => {
            suggestions.value = data;
        });
    });
};

const goToLink = async (slug: string): Promise<void> => {
    const { data } = await supabase
        .from('goods')
        .select('category, slug')
        .eq('slug', slug)
        .single<{ category: string; slug: string }>();

    if (data) {
        void router.push({
            name: 'good-details',
            params: {
                category: data.category,
                slug: data.slug,
            },
        });
    }
};
</script>

<template>
    <q-page>
        <BaseIntro
            v-model="model"
            :suggestions="suggestions"
            :filter-fn="filterFn"
            :go-to-link="goToLink" />
        <BaseFeatured />
        <BaseBlackMarket />
    </q-page>
</template>
