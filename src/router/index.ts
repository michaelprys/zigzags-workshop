import { createRouter, createWebHistory } from 'vue-router';
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreAuth } from 'stores/auth.store';
import type { Router } from 'vue-router';
import routes from './routes';

const router: Router = createRouter({
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
    routes,
    scrollBehavior(to, _, savedPosition) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (savedPosition) {
                    resolve(savedPosition);
                } else if (to.hash) {
                    resolve({ el: to.hash, behavior: 'smooth' });
                } else {
                    resolve({ top: 0 });
                }
            }, 150);
        });
    },
});

router.beforeEach(async (to, from, next) => {
    const storeAuth = useStoreAuth();
    const storeInventory = useStoreInventory();

    await storeAuth.checkSession();

    if (to.query.session_id && to.query.status === 'success') {
        return next();
    }

    if (!storeAuth.session) {
        if (to.name === 'vault') return next({ name: 'access-vault' });
        if (to.name === 'black-market' || to.name === 'black-market-details') {
            return next({ name: 'black-market-access' });
        }

        return next();
    }

    if (to.name === 'black-market') {
        await storeInventory.checkInvitation();
        if (!storeInventory.invitation) return next({ name: 'black-market-access' });

        return next();
    }

    next();
});

export default router;
