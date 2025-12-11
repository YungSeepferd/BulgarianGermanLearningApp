import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import svelteParser from 'svelte-eslint-parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import sveltePlugin from 'eslint-plugin-svelte';
import unicornPlugin from 'eslint-plugin-unicorn';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'coverage/',
			'node_modules/',
			'*.config.js',
			'*.config.ts',
			'vite.config.ts',
			'vitest.config.ts',
			'vite.component-test.config.ts',
			'svelte.config.js',
			'playwright.config.ts',
			'playwright-ct.config.ts',
			'playwright-ct-simple.config.ts',
			'tests/setup.js',
			'public/',
			'themes/',
			'tools/',
			'*.min.js'
		]
	},
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2022,
				NodeJS: 'readonly'
			},
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			unicorn: unicornPlugin
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/prefer-as-const': 'error',
			'no-console': 'warn',
			'no-debugger': 'error',
			'unicorn/no-array-reduce': 'off',
			'unicorn/prefer-ternary': 'off',
			'unicorn/no-object-as-default-parameter': 'off',
			'no-prototype-builtins': 'off',
			'comma-dangle': ['error', 'never'],
			'no-multiple-empty-lines': ['error', { max: 2 }],
			'object-curly-spacing': ['error', 'always']
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.es2022,
				$state: 'readonly',
				$derived: 'readonly',
				$props: 'readonly',
				$bindable: 'readonly',
				$inspect: 'readonly',
				$effect: 'readonly'
			},
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				ecmaVersion: 'latest',
				sourceType: 'module',
				extraFileExtensions: ['.svelte']
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			'jsx-a11y': jsxA11yPlugin,
			svelte: sveltePlugin
		},
		rules: {
			'no-inner-declarations': 'off',
			'jsx-a11y/no-autofocus': 'off',
			'jsx-a11y/no-static-element-interactions': 'off',
			'jsx-a11y/click-events-have-key-events': 'off',
			'jsx-a11y/no-noninteractive-element-interactions': 'off',
			'jsx-a11y/interactive-supports-focus': 'off'
		},
		settings: {
			'jsx-a11y': {
				components: {
					Button: 'button',
					Input: 'input',
					Select: 'select',
					Textarea: 'textarea',
					Card: 'section',
					Flashcard: 'article',
					ProgressIndicator: 'progress',
					LoadingSpinner: 'div',
					ErrorBoundary: 'div',
					GradeControls: 'div',
					SessionStats: 'section',
					VirtualList: 'div',
					MarkdownLayout: 'div'
				}
			}
		}
	},
	{
		files: ['tests/**/*.{js,ts}'],
		languageOptions: {
			globals: {
				...globals.jest,
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				vi: 'readonly',
				page: 'writable',
				context: 'readonly'
			}
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'no-console': 'off',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
	  files: ['scripts/**/*.{js,ts}'],
	  rules: {
	    'no-console': 'off',
	    'no-unused-vars': 'off',
	    '@typescript-eslint/no-unused-vars': 'off'
	  }
	},
	{
	  files: ['debug-*.ts', 'simple-test.ts'],
	  rules: {
	    'no-console': 'off'
	  }
	}
];