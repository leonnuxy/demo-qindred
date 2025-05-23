/** @type {import('eslint').Linter.Config} */
const config = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        commonjs: true
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: ['react', 'react-hooks'],
    settings: {
        react: {
            version: 'detect'
        }
    },
    ignorePatterns: [
        'vendor/**/*',
        'node_modules/**/*',
        'public/**/*',
        'storage/**/*',
        'bootstrap/cache/**/*',
        '*.config.js'  // Ignore config files like vite.config.js
    ],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'no-undef': 'error',
        'no-useless-escape': 'off'
    },
    globals: {
        route: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly'
    }
};

module.exports = config;
