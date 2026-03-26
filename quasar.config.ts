import { configure } from 'quasar/wrappers';
import VitePluginChecker from 'vite-plugin-checker';

export default configure(() => ({
    boot: ['quasar-defaults', 'query'],
    css: ['app.scss', 'common.scss'],
    extras: ['roboto-font', 'material-icons'],
    htmlVariables: { productName: "Zigzag's Workshop" },
    build: {
        target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari14'], node: 'node20' },
        typescript: { strict: true, vueShim: true },
        vueRouterMode: 'hash',
        vitePlugins: [
            [
                VitePluginChecker,
                {
                    typescript: false,
                    vueTsc: false,
                    overlay: {
                        initialIsOpen: false,
                        position: 'bl',
                        panelStyle: `
                            background-color: #0B141E;
                            color: #ffffff;
                            padding: 1rem;
                            border-radius: .5rem;
                            border: 0.0625rem solid #444444;
                            box-shadow: 0 .25rem .5rem rgba(0, 0, 0, 0.3);
                            font-family: Arial, sans-serif;
                        `,
                        badgeStyle: `
                            background-color: transparent;
                            color: #a8d0e6;
                            font-size: .875rem;
                            padding: .5rem 1rem;
                            opacity: 0.5;
                            filter: grayscale(1)
                        `,
                    },
                },
            ],
        ],
    },
    devServer: { open: false },
    framework: { plugins: ['Notify', 'Dialog'] },
}));
