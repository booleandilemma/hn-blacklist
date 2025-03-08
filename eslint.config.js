import globals from "globals";
import eslintConfigESLint from "eslint-config-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginJs from "@eslint/js";

export default [
    pluginJs.configs.recommended,
    ...eslintConfigESLint,
    eslintConfigPrettier,
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
        rules: {
            "class-methods-use-this": "off",
            "no-plusplus": "off",
            "no-console": "off",
            "linebreak-style": "off",
            "quotes": "off",
            "camelcase": "off",
            "max-classes-per-file": "off",
            "prefer-destructuring": "off",
            "no-alert": "off",
            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-returns": "off",
            "eqeqeq": ["error", "smart"],
            "@eslint-community/eslint-comments/require-description": "off",
            "class-methods-use-this": "off",
            "no-param-reassign": "off",
            "jsdoc/require-description": "off"
        }
    },

];
