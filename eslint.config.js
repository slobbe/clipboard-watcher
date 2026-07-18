import js from "@eslint/js";

export default [
    {
        ignores: ["dist/**"],
    },
    {
        files: ["src/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                TextEncoder: "readonly",
            },
        },
        rules: js.configs.recommended.rules,
    },
];
