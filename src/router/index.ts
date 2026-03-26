import { createRouter, createWebHistory } from 'vue-router';
import { useStoreInventory } from 'stores/inventory.store';
import { useStoreAuth } from 'stores/auth.store';
import { defineRouter } from '#q-app/wrappers';
import routes from './routes';

export default defineRouter(function () {
    const createHistory = createWebHistory;
    const Router = createRouter({
        scrollBehavior(to, _, savedPosition) {
            return new Promise((resolve) => {
                const timeout = 150;

                setTimeout(() => {
                    if (savedPosition) {
                        resolve(savedPosition);
                    } else if (to.hash) {
                        resolve({
                            el: to.hash,
                            behavior: 'smooth',
                        });
                    } else {
                        resolve({ top: 0 });
                    }
                }, timeout);
            });
        },
        routes,
        history: createHistory(process.env.VUE_ROUTER_BASE),
    });

    Router.beforeEach(async (to, from, next) => {
        const storeAuth = useStoreAuth();
        const storeInventory = useStoreInventory();

        await storeAuth.checkSession();

        if (to.query.session_id && to.query.status === 'success') {
            return next();
        }

        if (!storeAuth.session) {
            if (to.name === 'vault') {
                return next({ name: 'access-vault' });
            }

            if (to.name === 'black-market' || to.name === 'black-market-details') {
                return next({ name: 'black-market-access' });
            }

            return next();
        }

        if (to.name === 'black-market') {
            await storeInventory.checkInvitation();

            if (!storeInventory.invitation || storeInventory.invitation.length === 0) {
                return next({ name: 'black-market-access' });
            }

            return next();
        }

        if (to.name === 'good-details') {
            return next();
        }
        next();
    });

    return Router;
});
