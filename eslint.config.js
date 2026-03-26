import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import pluginQuasar from '@quasar/app-vite/eslint';
import stylistic from '@stylistic/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import vueParser from 'vue-eslint-parser';

export default tseslint
    .config(
        ...pluginQuasar.configs.recommended(),
        js.configs.recommended,
        ...tseslint.configs.recommendedTypeChecked,
        ...pluginVue.configs['flat/strongly-recommended'],
        stylistic.configs.recommended,
        perfectionist.configs['recommended-flat'],
        {
            files: ['**/*.ts', '**/*.vue'],
            plugins: {
                perfectionist,
                '@stylistic': stylistic,
                vue: pluginVue,
                '@typescript-eslint': tseslint.plugin,
            },
            languageOptions: {
                parser: vueParser,
                parserOptions: {
                    parser: tseslint.parser,
                    projectService: true,
                    tsconfigRootDir: import.meta.dirname,
                    extraFileExtensions: ['.vue'],
                },
                globals: {
                    ...globals.browser,
                    ...globals.node,
                    process: 'readonly',
                },
            },
            rules: {
                'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
                '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
                'perfectionist/sort-imports': [
                    'error',
                    {
                        type: 'line-length',
                        order: 'desc',
                        sortSideEffects: true,
                        groups: [
                            [
                                'side-effect',
                                'builtin',
                                'external',
                                'internal',
                                'parent',
                                'sibling',
                                'index',
                                'style',
                                'unknown',
                            ],
                        ],
                    },
                ],
                '@stylistic/padding-line-between-statements': [
                    'error',
                    {
                        blankLine: 'always',
                        prev: '*',
                        next: ['interface', 'type', 'function', 'export', 'return'],
                    },
                    { blankLine: 'always', prev: ['interface', 'type'], next: '*' },
                    { blankLine: 'always', prev: 'import', next: '*' },
                    { blankLine: 'any', prev: 'import', next: 'import' },
                ],
                '@stylistic/type-annotation-spacing': ['error', { after: true }],
                'vue/padding-line-between-blocks': ['error', 'always'],
            },
        },
        prettierSkipFormatting,
    )
    .filter(Boolean);
