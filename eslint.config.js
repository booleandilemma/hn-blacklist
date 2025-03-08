import eslintConfigESLint from "eslint-config-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginJs from "@eslint/js";

export default [
    pluginJs.configs.recommended,
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
            "jsdoc/require-jsdoc": 0,
            "eqeqeq": ["error", "smart"],
        }
    },
    ...eslintConfigESLint,
    eslintConfigPrettier
];
