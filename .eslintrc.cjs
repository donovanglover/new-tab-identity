module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'love',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    "plugin:tailwindcss/recommended",
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: [
    "simple-import-sort",
    "react",
    'react-refresh'
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
