module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: false,
    node: true,
    es2021: true
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    react: {
      version: '18.2'
    },
    next: {
      rootDir: ['apps/web']
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.base.json'
      }
    },
    'import/core-modules': ['next-intl/client']
  },
  rules: {
    'import/order': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/label-has-associated-control': 'off'
  },
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      env: {
        browser: true
      },
      extends: ['next/core-web-vitals']
    },
    {
      files: ['apps/api/**/*.ts'],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      env: {
        jest: true
      }
    }
  ],
  ignorePatterns: ['**/dist', '**/.next', '**/node_modules', '**/*.d.ts']
};
