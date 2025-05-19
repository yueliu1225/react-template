module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['react', 'prettier'],
    extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
    rules: {
      'prettier/prettier': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
  }
  