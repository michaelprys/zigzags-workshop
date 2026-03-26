import { acceptHMRUpdate, defineStore } from 'pinia';
import supabaseApi from 'src/api/supabase.api';
import { ref } from 'vue';

type User = {
    id: string;
    first_name: string;
    email: string;
    user_metadata?: string;
};

type AuthSession = {
    user: User | null;
};

export const useStoreAuth = defineStore('auth', () => {
    const session = ref<AuthSession | null>(null);
    const checkSession = async () => {
        const { data, error } = await supabaseApi.auth.getSession();

        if (error) {
            console.error('Session fetch error:', error);

            return;
        }
        session.value = data.session?.user || null;
    };

    return {
        session,
        checkSession,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useStoreAuth, import.meta.hot));
}
