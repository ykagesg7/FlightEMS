import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'temp/**', '*.txt', '*.ps1', '*-original.tsx'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'prefer-const': 'error',
      'no-case-declarations': 'error',
      'no-useless-catch': 'error',
      'import/order': ['error', {
        'newlines-between': 'always',
        'groups': [
          'builtin',
          'external', 
          'internal',
          'parent',
          'sibling',
          'index'
        ]
      }],
    },
  }
);
