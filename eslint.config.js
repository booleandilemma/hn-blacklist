import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.commonjs
            }
        }
    },
    {
        files: ['*.js'],
        rules: {
            'class-methods-use-this': 'off',
            'no-plusplus': 'off',
            'no-console': 'off',
            'linebreak-style': 'off',
            'quotes': 'off',
            'camelcase': 'off',
            'max-classes-per-file': 'off',
            'strict': 'off',
            'prefer-destructuring': 'off',
            'no-alert': 'off'
        }
    },
    eslintConfigPrettier
];
