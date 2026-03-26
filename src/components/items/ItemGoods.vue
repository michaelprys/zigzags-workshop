<script setup lang="ts">
import { useManageStash } from 'src/composables/useManageStash';
import { useTransition } from 'src/composables/useTransition';
import { useStoreGoods, type Good } from 'stores/goods.store';
import { delayUtils } from 'src/utils/delay.utils';
import { ref, watch } from 'vue';

const { transitionName, applyTransition } = useTransition();
const storeGoods = useStoreGoods();
const { addToStash } = useManageStash();
const props = defineProps<{
    classCard: string;
    queryData: Good[];
    isPending: boolean;
}>();
const imgLoaded = ref<Record<number, boolean>>({});

watch(
    () => props.queryData,
    (newGoods) => {
        if (!newGoods) return;
        newGoods.forEach((good) => {
            const img = new Image();

            img.onload = async () => {
                if (!props.isPending) {
                    imgLoaded.value[good?.id] = true;
                } else {
                    await delayUtils(200);
                    imgLoaded.value[good?.id] = true;
                }
            };
            img.src = good?.image_url;
        });
    },
    { immediate: true, deep: true },
);
</script>

<template>
    <div class="column flex-center q-px-md relative-position">
        <TransitionGroup
            :name="transitionName"
            tag="ul"
            class="flex flex-center q-gutter-lg q-mt-none q-pl-none"
            style="max-width: 84.5rem">
            <li v-for="good in queryData" :key="good.id" style="cursor: pointer">
                <q-card :class="classCard" flat dark>
                    <div>
                        <div class="image-wrapper relative">
                            <Transition name="fade">
                                <q-skeleton
                                    v-if="!imgLoaded[good.id]"
                                    animation="blink"
                                    animation-speed="1800"
                                    dark
                                    square
                                    class="skeleton-img" />
                            </Transition>
                            <q-img class="image" :src="good.image_url" />
                        </div>
                        <q-card-section>
                            <div class="relative items-center no-wrap row">
                                <Transition name="fade">
                                    <q-skeleton
                                        v-if="!imgLoaded[good.id]"
                                        animation="blink"
                                        dark
                                        animation-speed="1800"
                                        class="skeleton"
                                        style="height: 2rem; margin: 1rem" />
                                </Transition>
                                <div class="col ellipsis text-h6 text-primary">
                                    {{ good.name }}
                                </div>
                            </div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                            <div class="relative items-center no-wrap row">
                                <Transition name="fade">
                                    <q-skeleton
                                        v-if="!imgLoaded[good.id]"
                                        animation="blink"
                                        dark
                                        animation-speed="1800"
                                        class="skeleton"
                                        style="height: 5.25rem; margin-inline: 1rem" />
                                </Transition>
                                <div>
                                    <div class="flex items-center" style="gap: 0.3125rem">
                                        <span class="text-secondary text-subtitle1">
                                            Price: {{ good.price }} gold
                                        </span>
                                        <div
                                            v-if="good.debuff"
                                            class="flex items-center text-negative"
                                            style="margin-bottom: 0.1875rem">
                                            <slot name="debuff"></slot>
                                        </div>
                                    </div>
                                    <span class="inline-block text-caption text-grey">
                                        {{ good.short_description }}
                                    </span>
                                </div>
                            </div>
                        </q-card-section>
                    </div>
                    <q-card-actions class="flex justify-between">
                        <div class="relative items-center no-wrap row">
                            <Transition name="fade">
                                <q-skeleton
                                    v-if="!imgLoaded[good.id]"
                                    animation="blink"
                                    dark
                                    animation-speed="1800"
                                    type="QBtn"
                                    class="skeleton-add" />
                            </Transition>
                            <q-btn flat color="primary" @click="addToStash(good)">
                                💰 &nbsp; Add to stash
                            </q-btn>
                        </div>
                        <q-card-actions>
                            <div class="relative items-center no-wrap row">
                                <Transition name="fade">
                                    <q-skeleton
                                        v-if="!imgLoaded[good.id]"
                                        animation="blink"
                                        dark
                                        animation-speed="1800"
                                        type="QBtn" />
                                </Transition>
                                <RouterLink
                                    :to="{
                                        name: 'good-details',
                                        params: {
                                            category: good?.category,
                                            slug: good?.slug,
                                        },
                                    }"
                                    @click="storeGoods.selectGood(good)">
                                    <q-btn flat color="primary">Details</q-btn>
                                </RouterLink>
                            </div>
                        </q-card-actions>
                    </q-card-actions>
                </q-card>
            </li>
        </TransitionGroup>
        <div @click="applyTransition('pagination', 150)">
            <slot name="pagination"></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.skeleton-img {
    height: 13.125rem;
    border-top-left-radius: $rounded;
    border-top-right-radius: $rounded;
}

.skeleton-add {
    position: absolute;
    width: 9.3448rem;
    background-color: $placeholder-primary;
    margin-inline: 0.5rem;
}

.skeleton-details {
    position: absolute;
    width: 4.6019rem;
    background-color: $placeholder-primary;
    margin-right: 0.5rem;
}

.card {
    &:hover .image {
        transform: scale(1.05);
    }
}

.image-wrapper {
    border-top-left-radius: $rounded;
    border-top-right-radius: $rounded;
    overflow: hidden;
}

.image {
    transform: scale(1);
    height: 13.125rem;
    transition: transform 0.15s linear;
}
</style>
