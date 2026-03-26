interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_PUBLISHABLE_KEY: string;
    readonly VITE_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
