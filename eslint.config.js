const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      'semi': 'error',
      'no-multiple-empty-lines': [
        'error',
        {
          max: 2, // Maximum number of consecutive blank lines allowed
          maxEOF: 1, // Maximum number of blank lines allowed at the end of the file
          maxBOF: 0, // Maximum number of blank lines allowed at the beginning of the file
        },
      ],
    },
  },
];
