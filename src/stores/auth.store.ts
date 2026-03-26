import { acceptHMRUpdate, defineStore } from 'pinia';
import type { User } from '@supabase/supabase-js';
import supabaseApi from 'src/api/supabase.api';
import { ref } from 'vue';

export const useStoreAuth = defineStore('auth', () => {
    const session = ref<User | null>(null);

    const checkSession = async () => {
        const { data, error } = await supabaseApi.auth.getSession();

        if (error) {
            console.error('Session fetch error:', error);

            return;
        }

        session.value = data.session?.user ?? null;
    };

    return {
        session,
        checkSession,
    };
});

interface ImportMetaHot {
    accept: (cb: unknown) => void;
}

const hot = (import.meta as unknown as { hot?: ImportMetaHot }).hot;
if (hot) {
    hot.accept(acceptHMRUpdate(useStoreAuth, hot));
}
