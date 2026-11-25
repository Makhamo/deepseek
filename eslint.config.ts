import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Dependency boundaries (spec §3):
 *  - a service depends only on @uhs/contracts and @uhs/service-kit
 *  - a service never imports another service
 *  - apps/web imports @uhs/contracts and @uhs/ui, never service code
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/migrations/**',
      'infra/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      eqeqeq: ['error', 'smart'],
    },
  },
  {
    files: ['services/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../services/*', '../../../services/*', '@uhs/service-kit/*/src/*'],
              message:
                'A service must never import another service. Cross-service types belong in @uhs/contracts.',
            },
            {
              group: ['@uhs/ui', '@uhs/config'],
              message: 'A service depends only on @uhs/contracts and @uhs/service-kit.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@uhs/service-kit', '@uhs/service-kit/*', '../../services/*'],
              message:
                'apps/web must never import service code. Call services over HTTP through src/lib/service-client.ts.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
