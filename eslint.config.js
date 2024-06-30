import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'no-console': 'error',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        console: true,
        chrome: true,
      },
    },
  },
];
