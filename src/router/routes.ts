import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('src/layouts/LayoutMain.vue'),
        children: [
            {
                path: '',
                name: 'base',
                component: () => import('pages/PageBase.vue'),
            },
            {
                path: '',
                component: () => import('src/layouts/LayoutVault.vue'),
                children: [
                    {
                        path: '',
                        component: () => import('src/layouts/LayoutAuth.vue'),
                        children: [
                            {
                                path: 'access-vault',
                                name: 'access-vault',
                                component: () => import('pages/PageAccessVault.vue'),
                            },
                            {
                                path: 'setup-vault',
                                name: 'setup-vault',
                                component: () => import('pages/PageSetUpVault.vue'),
                            },
                            {
                                path: 'order-key',
                                name: 'order-key',
                                component: () => import('pages/PageOrderKey.vue'),
                            },
                            {
                                path: 'set-new-vault-key',
                                name: 'set-new-vault-key',
                                component: () => import('pages/PageSetNewKey.vue'),
                            },
                        ],
                    },
                    {
                        path: 'vault',
                        name: 'vault',
                        component: () => import('pages/PageVault.vue'),
                    },
                ],
            },
            {
                path: 'guide',
                name: 'guide',
                component: () => import('src/pages/PageGuide.vue'),
            },
            {
                path: 'workshop',
                name: 'workshop',
                component: () => import('pages/PageWorkshop.vue'),
            },
            {
                path: 'goods/:category/:slug',
                name: 'good-details',
                component: () => import('pages/PageGoodDetails.vue'),
            },
            {
                path: 'stash',
                name: 'stash',
                component: () => import('pages/PageStash.vue'),
            },
            {
                path: 'purchase-success',
                name: 'purchase-success',
                component: () => import('pages/PagePurchaseSuccess.vue'),
                beforeEnter: (to, from, next) => {
                    if (!sessionStorage.getItem('purchaseCompleted')) {
                        next('/');
                    } else {
                        sessionStorage.removeItem('purchaseCompleted');
                        next();
                    }
                },
            },
            {
                path: 'black-market-access',
                name: 'black-market-access',
                component: () => import('src/pages/PageBlackMarketAccess.vue'),
            },
            {
                path: 'black-market',
                name: 'black-market',
                component: () => import('pages/PageBlackMarket.vue'),
            },
        ],
    },
    {
        path: '/:catchAll(.*)*',
        name: 'not-found',
        component: () => import('src/pages/PageNotFound.vue'),
    },
];

export default routes;
