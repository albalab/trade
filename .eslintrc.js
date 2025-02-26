module.exports = {
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@babel/eslint-parser', // или '@typescript-eslint/parser', если используете TypeScript
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        browser: true,
        node: true,
    },
    plugins: ['vue'],
    rules: {
        // ваши правила
    },
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
    },
};
