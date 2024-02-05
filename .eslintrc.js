module.exports = {
  parser: "@typescript-eslint/parser",
  root: true,
  plugins: ["prettier"],
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-explicit-any": "warn",
  },
}
