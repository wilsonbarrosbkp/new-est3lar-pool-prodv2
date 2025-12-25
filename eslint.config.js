import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // DOM types
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLTableSectionElement: 'readonly',
        HTMLTableRowElement: 'readonly',
        HTMLTableCellElement: 'readonly',
        HTMLTableCaptionElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLLabelElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLOptionElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        React: 'readonly',
        // Dialogs
        confirm: 'readonly',
        alert: 'readonly',
        prompt: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // TypeScript rules
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off', // Common pattern in React component props

      // Import sorting rules
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. React e bibliotecas externas
            ['^react', '^@?\\w'],
            // 2. Alias imports (@/)
            ['^@/'],
            // 3. Relative imports
            ['^\\.'],
            // 4. Type imports
            ['^.*\\u0000$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js', '*.config.ts'],
  },
]
