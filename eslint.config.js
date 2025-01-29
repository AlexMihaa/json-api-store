const tseslint = require("@typescript-eslint/eslint-plugin");
const angular = require("@angular-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
    {
        files: ["**/*.ts"],
        ignores: ["node_modules/**"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "@angular-eslint": angular,
        },
        rules: {
            curly: "error",
            "no-console": [
                "warn",
                { allow: ["warn", "error"] },
            ],
            "no-bitwise": "error",
            "eqeqeq": ["error", "always", { null: "ignore" }],
            semi: ["error", "always"],
            indent: ["error", 2],

            "@angular-eslint/use-pipe-transform-interface": "error",
            "@angular-eslint/directive-selector": [
                "error",
                {
                    type: "attribute",
                    prefix: "app",
                    style: "camelCase",
                },
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: "app",
                    style: "kebab-case",
                },
            ],

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-expressions": "error",
            "@typescript-eslint/no-use-before-define": "error",
        },
    },
];
