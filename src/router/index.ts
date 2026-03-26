import { createRouter, createWebHistory } from 'vue-router';
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreAuth } from 'stores/auth.store';
import { routes } from './routes';

const router = createRouter({
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return new Promise((resolve) => {
            if (to.path === from.path) {
                return resolve(false);
            }

            const delay = 350;

            setTimeout(() => {
                if (savedPosition) {
                    resolve(savedPosition);
                } else {
                    resolve({ left: 0, top: 0 });
                }
            }, delay);
        });
    },
});

router.beforeEach(async (to) => {
    const storeAuth = useStoreAuth();
    const storeInventory = useStoreInventory();

    await storeAuth.checkSession();

    if (to.query.session_id && to.query.status === 'success') {
        return true;
    }

    if (!storeAuth.session) {
        if (to.name === 'vault') {
            return { name: 'access-vault' };
        }

        const blackMarketRoutes = ['black-market', 'black-market-details'];
        if (blackMarketRoutes.includes(to.name as string)) {
            return { name: 'black-market-access' };
        }

        return true;
    }

    if (to.name === 'black-market') {
        await storeInventory.checkInvitation();
        if (!storeInventory.invitation) {
            return { name: 'black-market-access' };
        }
    }

    return true;
});

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

export default router;
