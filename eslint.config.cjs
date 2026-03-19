const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: ["assets/fonts/**", "assets/images/**", "assets/icons/**", "node_modules/**"]
  },
  js.configs.recommended,
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser
      }
    }
  }
];
