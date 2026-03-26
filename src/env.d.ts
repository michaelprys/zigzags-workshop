interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_PUBLISHABLE_KEY: string;
    readonly VITE_BASE_URL: string;

    readonly VITE_PRICE_GOLD: string;
    readonly VITE_PRICE_EMBERHEART_RUBIES: string;
    readonly VITE_PRICE_GAMBLERS_LOOTBOX: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
