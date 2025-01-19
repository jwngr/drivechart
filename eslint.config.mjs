import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const SHARED_LANGUAGE_OPTIONS = {
  ecmaVersion: 2022,
  sourceType: 'module',
  parser: tseslint.parser,
  parserOptions: {
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: '.',
  },
};

const NO_RELATIVE_IMPORTS_PATTERN = {
  group: ['.*'],
  message: 'Use imports like `@src` and `@shared` instead of relative paths.',
};

const NO_SHARED_CLIENT_IMPORT_PATTERN = {
  group: ['@sharedClient', '@sharedClient/*'],
  message: 'Importing from the `@sharedClient` package is not allowed in this package.',
};

function makeSharedRules({disallowSharedClientImports}) {
  return {
    'no-console': 'error',
    '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TryStatement',
        message:
          'Using a `try` / `catch` block directly is discouraged. Use `syncTry` or `asyncTry` helpers instead.',
      },
      {
        selector: 'Identifier[name="fetch"]',
        message:
          'Using `fetch` directly is discouraged. Use `request*` helpers like `requestGet` or `requestPost` instead.',
      },
      {
        selector: 'ThrowStatement',
        message: 'Throwing errors directly is discouraged. Use `ErrorResult` instead.',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          NO_RELATIVE_IMPORTS_PATTERN,
          disallowSharedClientImports ? NO_SHARED_CLIENT_IMPORT_PATTERN : null,
        ].filter((p) => p !== null),
      },
    ],
  };
}

export default tseslint.config(
  // ESLint.
  eslint.configs.recommended,

  // TypeScript.
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // React.
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    // CLI settings.
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // This effectively sets max-warnings to 0, but allows TODOs to be ignored.
      'no-warning-comments': [
        'error',
        {
          terms: ['fixme', 'xxx', 'hack'],
          location: 'start',
        },
      ],
    },
  },

  // Shared package config.
  {
    files: ['packages/shared/src/**/*.ts'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    rules: makeSharedRules({
      disallowSharedClientImports: true,
    }),
  },

  // Shared client package config.
  {
    files: ['packages/sharedClient/**/*.{ts,tsx}'],
    languageOptions: {
      ...SHARED_LANGUAGE_OPTIONS,
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...makeSharedRules({
        disallowSharedClientImports: false,
      }),
    },
  },

  // PWA package config.
  {
    files: ['packages/pwa/**/*.{ts,tsx}'],
    languageOptions: {
      ...SHARED_LANGUAGE_OPTIONS,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...makeSharedRules({
        disallowSharedClientImports: false,
      }),
    },
  }
);
