<script setup lang="ts">
import { useStoreGoods } from 'stores/goods.store';
import { useStoreAuth } from 'stores/auth.store';
import type { Good } from 'stores/goods.store';
import { useQuery } from '@pinia/colada';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';

const storeAuth = useStoreAuth();
const storeGoods = useStoreGoods();
const router = useRouter();
const model = ref(null);
const suggestions = ref<Suggestion[]>([]);
const searchVal = ref('');

type Suggestion = {
    label: string;
    value: string;
    link: string;
};

const { data: queryData } = useQuery({
    key: () =>
        storeAuth.session?.user?.id ? ['suggestions', storeAuth.session.user.id] : ['suggestions'],
    query: () => storeGoods.loadSuggestedGoods(),
    staleTime: 1000 * 60 * 5,
});
const formattedSuggestions = computed(() => {
    return (
        queryData?.value?.map((good: Good) => ({
            label: good.name,
            value: good.slug,
            link: `/goods/${good.category}/${good.slug}`,
        })) || []
    );
});
const filterFn = (val: string, update: (fn: () => void) => void) => {
    searchVal.value = val;

    if (val.length < 2) {
        update(() => {
            suggestions.value = [];
        });

        return;
    }
    update(() => {
        const needle = val.toLowerCase();

        suggestions.value = formattedSuggestions.value.filter((v: Suggestion) =>
            v.label.toLowerCase().includes(needle),
        );
    });
};
const goToLink = async (option: Suggestion | string | null) => {
    if (!option || typeof option === 'string') return;
    const foundSuggestion = queryData?.value?.find(
        (suggestion: Good) => suggestion.slug === option.value,
    );

    if (foundSuggestion) {
        storeGoods.selectGood(foundSuggestion);
        await router.push(option.link);
        model.value = null;
    }
};
</script>

<template>
    <section id="intro">
        <h1 class="sr-only">Introduction</h1>
        <div class="flex flex-center q-px-md">
            <div class="relative-position shadow-8 text-center wrapper">
                <div class="column fit flex-center">
                    <div class="q-px-lg" style="z-index: 1">
                        <h2 class="title text-glow-dark text-h3 text-primary">
                            Time is money, friend!
                        </h2>
                        <h3 class="subtitle q-mt-lg text-h5 text-secondary">
                            I got the best deals anywhere
                        </h3>
                        <q-select
                            v-model="model"
                            :options="suggestions"
                            class="select q-mt-lg"
                            label-color="info"
                            color="secondary"
                            dark
                            label="Search for goods"
                            use-input
                            hide-selected
                            fill-input
                            input-debounce="300"
                            style="width: 100%"
                            @filter="filterFn"
                            @update:model-value="goToLink">
                            <template #option="scope">
                                <q-item clickable v-bind="scope.itemProps">
                                    <q-item-section class="text-primary text-left">
                                        <q-item-label>
                                            {{ scope.opt.label }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </template>
                            <template #no-option>
                                <q-item v-if="searchVal.length >= 2">
                                    <q-item-section class="text-primary text-left">
                                        No results for "{{ searchVal }}"
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                        <div class="q-pa-md">
                            <div class="q-gutter-md row"></div>
                        </div>
                    </div>
                </div>
                <div class="parallax-wrapper absolute-top fit">
                    <q-parallax class="parallax fit">
                        <template #media>
                            <video
                                class="video"
                                width="1516"
                                height="926"
                                poster="~assets/images/base/poster.avif"
                                loop
                                muted
                                autoplay>
                                <source src="~assets/images/base/intro.mp4" type="video/mp4" />
                            </video>
                            <div class="layer"></div>
                        </template>
                    </q-parallax>
                    <div class="poster"></div>
                </div>
            </div>
        </div>
    </section>
    <div class="separator"></div>
</template>

<style lang="scss" scoped>
@use 'sass:map';

#intro {
    padding-top: 5.8em;
    padding-bottom: 8.5em;
}

.wrapper {
    position: relative;
    max-width: 92.5rem;
    width: 100%;
    height: 40rem;
}

.parallax-wrapper {
    border-radius: $rounded;
}

.poster {
    display: none;
    width: 100%;
    height: 100%;
    background-image: url('/src/assets/images/base/poster.avif');
    background-position: center;
    background-size: cover;
}

@media (width <= $breakpoint-sm) {
    .title {
        font-size: map.get($h4, 'size');
    }

    .subtitle {
        font-size: map.get($body1, 'size');
        margin-top: 0.5rem;
    }

    :deep(.q-field__label) {
        font-size: map.get($body2, 'size');
    }
}

@media (width <= 69.4375rem) {
    .parallax {
        display: none;
    }

    .poster {
        display: block;
    }
}
</style>
